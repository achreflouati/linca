frappe.ui.form.on("Patient et demande", {
    refresh(frm) {
        // Check if the document is in draft state
        if (frm.doc.docstatus === 0) {
            // Check if the current user does not have the "Doctor" role
            if (!frappe.user_roles.includes("Doctor")) {
                // Add "Expertiser" button
                frm.add_custom_button("Expertiser", () => {
                    let dialog_fields = [
                        {
                            label: "Argumentaire",
                            fieldname: "argumentaire",
                            fieldtype: "Small Text",
                            placeholder: "Saisir l'argumentaire"
                        },
                        {
                            label: "Pas d'indication à débuter un traitement anti-infectieux",
                            fieldname: "pas_dindication",
                            fieldtype: "Check",
                            default: 0
                        },
                        {
                            label: "Arrêter un traitement antiinfectieux en cours",
                            fieldname: "arreter_traitement",
                            fieldtype: "Check",
                            default: 0
                        },
                        {
                            label: "Débuter un traitement antiinfectieux",
                            fieldname: "debuter_traitement",
                            fieldtype: "Check",
                            default: 0
                        },
                        {
                            label: "Molécule",
                            fieldname: "molécule",
                            fieldtype: "Select",
                            options: ["Option 1", "Option 2", "Option 3"]
                        },
                        {
                            label: "Voie d'administration",
                            fieldname: "voie",
                            fieldtype: "Select",
                            options: ["Orale", "Intraveineuse", "Autre"]
                        },
                        {
                            label: "Dose",
                            fieldname: "dose",
                            fieldtype: "Data"
                        },
                        {
                            label: "Durée (jours)",
                            fieldname: "duree",
                            fieldtype: "Int"
                        },
                        {
                            label: "Date de Rendez-vous",
                            fieldname: "date_rdv",
                            fieldtype: "Date"
                        },
                        {
                            label: "Surveillance clinique",
                            fieldname: "surveillance_clinique",
                            fieldtype: "Check",
                            default: 0
                        }
                    ];
                    let dialog = new frappe.ui.Dialog({
                        title: "Saisie des informations d'Expertise",
                        fields: dialog_fields,
                            
                        primary_action_label: "Enregistrer",
                        primary_action(values) {
                            frappe.call({
                                method: "frappe.client.insert",
                                args: {
                                    doc: {
                                        doctype: "Expert",
                                        ref: frm.doc.name,
                                        ...values
                                    }
                                },
                                callback: function (response) {
                                    if (!response.exc) {
                                        frappe.msgprint("L'expertise a été enregistrée avec succès !");
                                        dialog.hide();
                                        // Mettre à jour le statut dans le doctype courant
                                frm.set_value("status", "Avis préts");
                                frm.save();
                                    }
                                }
                            });
                            
                        }
                    });
        
                    // Ouvrir la popup
                    dialog.show();
                    /* frappe.confirm(
                        "Êtes-vous sûr de vouloir marquer ce document comme 'Expertise' ?",
                        () => {
                            frm.set_value("status", "Avis préts");
                            frm.save(); // Enregistrer le document pour changer le statut
                            frappe.msgprint("Le document a été marqué comme 'Expertise'.");
                            
                        }
                    ); */
                }).addClass("btn-success");

                // Add "Senioriser" button
                frm.add_custom_button("Senioriser", () => {
                    frappe.confirm(
                        "Êtes-vous sûr de vouloir marquer ce document comme 'Avis à modifier' ?",
                        () => {
                            frm.set_value("status", "Avis à modifier");
                            frm.save(); // Enregistrer le document pour changer le statut
                            frappe.msgprint("Le document a été marqué comme 'Avis à modifier'.");
                        }
                    );
                }).addClass("btn-secondary");

                // Add "Renvoyer" button
                frm.add_custom_button("Renvoyer", () => {
                    frappe.confirm(
                        "Êtes-vous sûr de vouloir marquer ce document comme 'Avis en cours' ?",
                        () => {
                            frm.set_value("status", "Avis en cours");
                            frm.save(); // Enregistrer le document pour changer le statut
                            frappe.msgprint("Le document a été marqué comme 'Avis en cours'.");
                        }
                    );
                }).addClass("btn-warning");
            }
        }
        

        
    },
    
    
    

    
});


// Custom CRMNotes Implementation
// class CustomCRMNotes {
//     constructor(opts) {
//         $.extend(this, opts);
//     }

//     refresh() {
//         this.notes_wrapper.find(".notes-section").remove();

//         let notes = this.frm.doc.notes || [];
//         notes.sort((a, b) => new Date(b.added_on) - new Date(a.added_on));

//         let notes_html = frappe.render_template("crm_notes", { notes: notes });
//         $(notes_html).appendTo(this.notes_wrapper);

//         this.add_note();

//         this.notes_wrapper.find(".edit-note-btn").on("click", (e) => this.edit_note(e.currentTarget));
//         this.notes_wrapper.find(".delete-note-btn").on("click", (e) => this.delete_note(e.currentTarget));
//     }

//     add_note() {
//         let dialog = new frappe.ui.Dialog({
//             title: __("Add a Note"),
//             fields: [{ label: "Note", fieldname: "note", fieldtype: "Text Editor", reqd: 1 }],
//             primary_action: (data) => {
//                 frappe.call({
//                     method: "add_note",
//                     doc: this.frm.doc,
//                     args: { note: data.note },
//                     callback: () => {
//                         this.frm.refresh_field("notes");
//                         this.refresh();
//                         dialog.hide();
//                     },
//                 });
//             },
//             primary_action_label: __("Add"),
//         });
//         dialog.show();
//     }

//     edit_note(edit_btn) {
//         let row = $(edit_btn).closest(".comment-content");
//         let row_id = row.attr("name");
//         let row_content = $(row).find(".content").html();

//         let dialog = new frappe.ui.Dialog({
//             title: __("Edit Note"),
//             fields: [{ label: "Note", fieldname: "note", fieldtype: "Text Editor", default: row_content }],
//             primary_action: (data) => {
//                 frappe.call({
//                     method: "edit_note",
//                     doc: this.frm.doc,
//                     args: { note: data.note, row_id: row_id },
//                     callback: () => {
//                         this.frm.refresh_field("notes");
//                         this.refresh();
//                         dialog.hide();
//                     },
//                 });
//             },
//             primary_action_label: __("Save"),
//         });
//         dialog.show();
//     }

//     delete_note(delete_btn) {
//         let row_id = $(delete_btn).closest(".comment-content").attr("name");
//         frappe.call({
//             method: "delete_note",
//             doc: this.frm.doc,
//             args: { row_id: row_id },
//             callback: () => {
//                 this.frm.refresh_field("notes");
//                 this.refresh();
//             },
//         });
//     }
// }
