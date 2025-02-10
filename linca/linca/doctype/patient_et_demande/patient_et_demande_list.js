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
        $(document).on('click', '.view-details', function(event) {
            event.preventDefault(); // Empêche l’ouverture du document
            event.stopPropagation(); // Empêche d'autres événements d'être déclenchés
            
            let docname = $(this).attr('data-name');
            openDetailsDialog(docname); // Appel de la fonction externe
        });
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
