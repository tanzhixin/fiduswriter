import {noSpaceTmp, escapeText} from "../../common"
import {descendantNodes} from "../tools/doc_content"

const DEFAULT_COMMENTS_XML = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + noSpaceTmp`
    <w:comments xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" mc:Ignorable="w14 wp14 w15">
    </w:comments>
    `

const DEFAULT_COMMENTS_EXTENDED_XML = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + noSpaceTmp`
    <w15:commentsEx xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" mc:Ignorable="w15">
    </w15:commentsEx>
    `


export class DocxExporterComments {
    constructor(exporter, commentsDB, docContent) {
        this.exporter = exporter
        this.commentsDB = commentsDB
        this.docContent = docContent
        this.comments = {}
        this.usedComments = []
        this.commentsXml = false
        this.commentsExtendedXml = false
        this.commentsFilePath = "word/comments.xml"
        this.commentsExtendedFilePath = "word/commentsExtended.xml"
        this.commentIdCounter = -1
    }

    init() {
        let useExtended = false
        descendantNodes(this.docContent).forEach(
            node => {
                if (node.marks) {
                    const comments = node.marks.filter(mark => mark.type === "comment")
                    comments.forEach(
                        comment => {
                            if (!this.usedComments.includes(comment.attrs.id)) {
                                this.usedComments.push(comment.attrs.id)
                                if (this.commentsDB[comment.attrs.id].resolved || this.commentsDB[comment.attrs.id].answers.length) {
                                    useExtended = true
                                }
                            }
                        }
                    )
                }
            }
        )
        if (!this.usedComments.length) {
            return Promise.resolve()
        }
        this.exporter.rels.addCommentsRel()
        const addCommentXMLs = [
            this.exporter.xml.getXml(this.commentsFilePath, DEFAULT_COMMENTS_XML).then(commentsXml => this.commentsXml = commentsXml)
        ]
        if (useExtended) {
            this.exporter.rels.addCommentsExtendedRel()
            addCommentXMLs.push(this.exporter.xml.getXml(this.commentsExtendedFilePath, DEFAULT_COMMENTS_EXTENDED_XML).then(commentsExtendedXml => this.commentsExtendedXml = commentsExtendedXml))
        }
        return Promise.all(addCommentXMLs).then(
            () => {
                Array.from(this.commentsXml.querySelectorAll("comment")).forEach(
                    el => {
                        const id = parseInt(el.getAttribute("w:id"), 16)
                        if (id > this.commentIdCounter) {
                            this.commentIdCounter = id
                        }
                    }
                )
                return this.exportComments()
            }
        )
    }

    addComment(id) {
        const commentId = (++this.commentIdCounter).toString(16)
        this.comments[id] = commentId
        const commentDBEntry = this.commentsDB[id]
        const comments = this.commentsXml.querySelector("comments")
        let string = `<w:comment w:id="${commentId}" w:author="${escapeText(commentDBEntry.username)}" w:date="${new Date(commentDBEntry.date).toISOString().split(".")[0]}Z" w:initials="${escapeText(commentDBEntry.username.split(" ").map((n) => n[0]).join("").toUpperCase())}">`
        let parentParagraphId = ""
        string += commentDBEntry.comment.map((node, index) => {
            const options = {section: "Comment"}
            if ((commentDBEntry.resolved || commentDBEntry.answers.length) && index === (commentDBEntry.comment.length - 1)) {
                // If comment has been resolved or there are answers, we need to add an id to the last paragraph
                // of the comment and add an entry into commentsExtended.xml.
                parentParagraphId = (++this.exporter.richtext.paragraphIdCounter).toString(16).padStart(8, "0")
                options.paragraphId = parentParagraphId
                const extendedString = `<w15:commentEx w15:paraId="${parentParagraphId}" w15:done="${commentDBEntry.resolved ? "1" : "0"}"/>`
                const extendedComments = this.commentsExtendedXml.querySelector("commentsEx")
                extendedComments.insertAdjacentHTML("beforeEnd", extendedString)
            }
            let markup = this.exporter.richtext.transformRichtext(node, options)
            if (!index) {
                markup += "<w:r><w:rPr><w:rStyle w:val=\"CommentReference\"/></w:rPr><w:annotationRef/></w:r>"
            }
            return markup
        }).join("")
        string += "</w:comment>"
        commentDBEntry.answers.forEach(answer => {
            const answerId = (++this.commentIdCounter).toString(16)
            string += `<w:comment w:id="${answerId}" w:author="${escapeText(answer.username)}" w:date="${new Date(answer.date).toISOString().split(".")[0]}Z" w:initials="${escapeText(answer.username.split(" ").map((n) => n[0]).join("").toUpperCase())}">`
            string += answer.answer.map((node, index) => {
                const options = {section: "CommentText"}
                if (index === (answer.answer.length - 1)) {
                    // We need to add an id to the last paragraph of the comment and add an entry
                    // into commentsExtended.xml pointing to the last paragraph of the parent comment.
                    const paragraphId = (++this.exporter.richtext.paragraphIdCounter).toString(16).padStart(8, "0")
                    options.paragraphId = paragraphId
                    const extendedString = `<w15:commentEx w15:paraId="${paragraphId}" w15:done="${commentDBEntry.resolved ? "1" : "0"}" w15:paraIdParent="${parentParagraphId}"/>`
                    const extendedComments = this.commentsExtendedXml.querySelector("commentsEx")
                    extendedComments.insertAdjacentHTML("beforeEnd", extendedString)
                }
                let markup = this.exporter.richtext.transformRichtext(node, options)
                if (!index) {
                    markup += "<w:r><w:rPr><w:rStyle w:val=\"CommentReference\"/></w:rPr><w:annotationRef/></w:r>"
                }
                return markup
            }).join("")
            string += "</w:comment>"
        })
        comments.insertAdjacentHTML("beforeEnd", string)
    }

    exportComments() {

        this.usedComments.forEach((comment) => {
            this.addComment(comment)
        })
        return Promise.resolve()
    }

}
