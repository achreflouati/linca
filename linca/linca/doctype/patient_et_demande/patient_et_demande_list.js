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
        listview.page.add_inner_button(__('Voir Détails'), function() {
            let selected = listview.get_checked_items();
            if (selected.length === 0) {
                frappe.msgprint(__('Sélectionnez un document pour voir les détails.'));
                return;
            }

            let docname = selected[0].name;

            // Récupérer les données du document via une requête Frappe
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
        });
    }
};
