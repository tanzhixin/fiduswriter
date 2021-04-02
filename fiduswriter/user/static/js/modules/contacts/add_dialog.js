import {addContactTemplate} from "./templates"
import {postJson, cancelPromise, Dialog, escapeText} from "../common"

//dialog for adding a user to contacts
export class AddContactDialog  {
    constructor(title = gettext('Add a user to your contacts'), returnUnregisteredEmail = false) {
        this.returnUnregisteredEmail = returnUnregisteredEmail // Whether to allow the dialog return an unregistred email instead of a user instance
        this.title = title
    }

    init() {
        return new Promise(resolve => {
            const buttons = [
                {
                    text: gettext('Submit'),
                    classes: "fw-dark",
                    click: () => {
                        const userString = document.getElementById('new-contact-user-string').value
                        document.querySelectorAll('#add-new-contact .warning').forEach(el => el.parentElement.removeChild(el))
                        return Promise.all(userString.split(/[\s,;]+/).map(singleUserString => {
                            if (!singleUserString.length) {
                                return false
                            }
                            return this.addContact(singleUserString)
                        }).filter(promise => !!promise)).then(
                            contactData => {
                                if (contactData.length) {
                                    dialog.close()
                                    resolve(contactData)
                                }
                            }
                        )
                    }
                },
                {
                    type: 'cancel'
                }
            ]

            const dialog = new Dialog({
                id: 'add-new-contact',
                title: this.title,
                body: addContactTemplate(),
                width: 350,
                height: 250,
                buttons
            })

            dialog.open()

            document.getElementById('new-contact-user-string').style.width = '340'
        })
    }

    addContact(userString) {
        //add a user to contact per ajax
        if (null === userString || 'undefined' == typeof(userString)) {
            return cancelPromise()
        }

        userString = userString.trim()
        if ('' === userString) {
            return cancelPromise()
        }

        return postJson(
            '/api/user/contacts/add',
            {
                user_string: userString
            }
        ).then(
            ({json, status}) => {
                if (status == 201) { //user added to the contacts
                    return json.contact
                } else { //user not found
                    let responseHtml
                    if (json.error === 1) {
                        responseHtml = gettext('You cannot add yourself to your contacts!')
                    } else if (json.error === 2) {
                        responseHtml = gettext('This person is already in your contacts')
                    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userString)) { // regex taken from https://tylermcginnis.com/validate-email-address-javascript/
                        responseHtml = gettext('No user is registered with the given email address.')
                        if (settings_REGISTRATION_OPEN || settings_SOCIALACCOUNT_OPEN) {
                            if (this.returnUnregisteredEmail) {
                                return {email: userString}
                            }
                            responseHtml += `<br>${gettext('Please invite him/her ')}` +
                            `<a href="mailto:${userString}?` +
                                `subject=${encodeURIComponent(gettext('Fidus Writer'))}&` +
                                `body=${encodeURIComponent(gettext('Hey, I would like you to sign up for a Fidus Writer account.'))} ` +
                                `${encodeURIComponent(gettext('Please register at'))} ${window.location.origin}` +
                            `">${gettext('by sending an email')}</a>!`
                        }

                    } else {
                        responseHtml = gettext('User is not registered.')
                    }
                    document.getElementById('add-new-contact').insertAdjacentHTML(
                        'beforeend',
                        `<div class="warning" style="padding: 8px;">${escapeText(userString)}: ${responseHtml}</div>`
                    )
                    return cancelPromise()
                }
            }
        )
    }
}
