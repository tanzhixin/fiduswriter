import {GeneralPasteHandler} from "./general"

// Fidus Writer paste handler
export class FidusWriterPasteHandler extends GeneralPasteHandler {

    outputHandlerType() {
        console.info('Fidus Writer paste handler')
    }

    // Convert an existing node to a different node, if needed.
    convertNode(node) {
        // Replace  nodes with other nodes to not change the number of child nodes
        // <b style="font-weight:normal;">...</b> => <span>...</span>
        if (node.tagName === 'SPAN' && node.classList.contains('citation')) {
            node = this.verifyCitationNode(node)
        }
        return node
    }

    verifyCitationNode(node) {
        try {
            let bibs = JSON.parse(node.dataset.bibs),
                references = JSON.parse(node.dataset.references),
                bibDB = this.editor.mod.db.bibDB,
                idTranslations = {}
            Object.keys(bibs).forEach(bibKey => {
                let reference = bibs[bibKey]
                let oldKey = bibDB.findReference(reference)
                if (oldKey) {
                    idTranslations[bibKey] = oldKey
                } else {
                    let newKey = bibDB.addReference(reference, bibKey)
                    idTranslations[bibKey] = newKey
                }
            })

            if (Object.entries(idTranslations).every(trans => trans[0] === trans[1])) {
                return node
            }
            references.forEach(ref => ref.id = idTranslations[ref.id])
            node.dataset.references = JSON.stringify(references)
            return node
        } catch (error) {
            return node
        }
    }

}
