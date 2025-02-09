frappe.ui.form.on("Patient et demande", {
    refresh(frm) {
        // Check if the document is in draft state
        if (frm.doc.docstatus === 0) {
            // Check if the current user does not have the "Doctor" role
            if (!frappe.user_roles.includes("Doctor")) {
                // Add "Expertiser" button
                frm.add_custom_button("Expertiser", () => {
                    let dialog = new frappe.ui.Dialog({
                        title: "Informations supplémentaires",
                        fields: [
                            {
                                label: "Nom du Patient",
                                fieldname: "patient_name",
                                fieldtype: "Data",
                                reqd: 1
                            },
                            {
                                label: "Date de rendez-vous",
                                fieldname: "appointment_date",
                                fieldtype: "Date",
                                reqd: 1
                            },
                            {
                                label: "Remarques",
                                fieldname: "remarks",
                                fieldtype: "Small Text"
                            }
                        ],
                        primary_action_label: "Enregistrer",
                        primary_action(values) {
                            // Action à exécuter lorsque l'utilisateur clique sur "Enregistrer"
                            frappe.msgprint({
                                title: "Confirmation",
                                message: `Nom : ${values.patient_name}<br>Date : ${values.appointment_date}<br>Remarques : ${values.remarks}`,
                                indicator: "green"
                            });
        
                            // Fermer la popup
                            dialog.hide();
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

        // Call show_notes function
        //frm.events.show_notes(frm);
    },

    // show_notes(frm) {
    //     if (frm.doc.docstatus !== 0) return;

    //     // Initialize CRMNotes
    //     const crm_notes = new CustomCRMNotes({
    //         frm: frm,
    //         notes_wrapper: $(frm.fields_dict.custom_notes_html.wrapper),
    //     });
    //     crm_notes.refresh();
    // },
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
