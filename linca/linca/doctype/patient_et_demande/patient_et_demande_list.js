frappe.listview_settings['Patient et demande'] = {
    add_fields: ['status', 'date'],
    get_indicator: function(doc) {
        var colors = {
            'Avis préts': 'green',
            'Avis à modifier': 'red',
            'Avis en cours': 'orange',
            'Draft': 'brown',
        };
        return [__(doc.status), colors[doc.status], 'status,=,' + doc.status];
    },

    onload: function(listview) {
        listview.page.add_button("Show Expertise", function() {
            let selected = listview.get_checked_items(); // Obtenir les éléments sélectionnés
            
            if (selected.length === 0) {
                frappe.msgprint("Veuillez sélectionner un enregistrement.");
                return;
            }

            let docname = selected[0].name; // Prendre le premier document sélectionné

            // Appeler l'API pour récupérer les détails de l'expertise
            frappe.call({
                method: "frappe.client.get_list",  // Utiliser frappe.client.get_list pour récupérer les données
                args: {
                    doctype: "Expert",  // Le doctype Expert
                    filters: {
                        ref: docname  // Filtrer par le champ ref du Patientetdemande
                    },
                    fields: ['argumentaire', 'molécule', 'voie', 'dose',  'date_rdv', 'surveillance_clinique']  // Les champs que vous voulez afficher
                },
                callback: function(response) {
                    if (response.message && response.message.length > 0) {
                        let expertise = response.message[0]; // Prendre le premier résultat retourné

                        // Créer un dialogue pour afficher les informations
                        let dialog = new frappe.ui.Dialog({
                            title: "Détails de l'Expertise",
                            fields: [
                                {
                                    label: "Argumentaire",
                                    fieldname: "argumentaire",
                                    fieldtype: "Small Text",
                                    read_only: 1,
                                    default: expertise.argumentaire || 'Non spécifié'
                                },
                                {
                                    label: "Molécule",
                                    fieldname: "molecule",
                                    fieldtype: "Data",
                                    read_only: 1,
                                    default: expertise.molecule || 'Non spécifié'
                                },
                                {
                                    label: "Voie d'administration",
                                    fieldname: "voie",
                                    fieldtype: "Data",
                                    read_only: 1,
                                    default: expertise.voie || 'Non spécifié'
                                },
                                {
                                    label: "Dose",
                                    fieldname: "dose",
                                    fieldtype: "Data",
                                    read_only: 1,
                                    default: expertise.dose || 'Non spécifié'
                                },
                                {
                                    label: "Durée (jours)",
                                    fieldname: "duree",
                                    fieldtype: "Int",
                                    read_only: 1,
                                    default: expertise.duree || 0
                                },
                                {
                                    label: "Date de Rendez-vous",
                                    fieldname: "date_rdv",
                                    fieldtype: "Date",
                                    read_only: 1,
                                    default: expertise.date_rdv || 'Non spécifié'
                                },
                                {
                                    label: "Surveillance clinique",
                                    fieldname: "surveillance_clinique",
                                    fieldtype: "Check",
                                    read_only: 1,
                                    default: expertise.surveillance_clinique || 0
                                }
                            ]
                        });

                        // Ouvrir le dialog pour afficher les informations
                        dialog.show();
                    } else {
                        frappe.msgprint("Aucune expertise trouvée pour ce document.");
                    }
                }
            });
        }, "primary").addClass("btn-success");  // Ajouter un bouton dans la barre d'actions
    }
};

// Fonction pour afficher les détails dans un dialogue
function openDetailsDialog(docname) {
    frappe.call({
        method: 'frappe.client.get',
        args: {
            doctype: 'Patient et demande',
            name: docname
        },
        callback: function(response) {
            let doc = response.message;
            if (!doc) {
                frappe.msgprint(__('Impossible de récupérer les données.'));
                return;
            }

            // Construire dynamiquement la liste des champs
            let fields = [];
            for (let key in doc) {
                if (doc.hasOwnProperty(key) && key !== 'doctype' && key !== 'name') {
                    fields.push({
                        label: frappe.model.unscrub(key),
                        fieldname: key,
                        fieldtype: 'Data',
                        default: doc[key],
                        read_only: 1
                    });
                }
            }

            let dialog = new frappe.ui.Dialog({
                title: __('Détails du Patient et demande'),
                size: 'large',
                fields: fields,
                primary_action_label: 'Fermer',
                primary_action() {
                    dialog.hide();
                }
            });

            dialog.show();
        }
    });
}
