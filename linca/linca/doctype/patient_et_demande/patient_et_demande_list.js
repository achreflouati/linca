frappe.listview_settings['Patient et demande'] = {
    add_fields: ['status','date'],
    get_indicator: function(doc) {
        var colors = {
            'Avis préts': 'green',
            'Avis à modifier': 'red',
            'Avis en cours': 'orange',
            'Draft':'brown',
        };
        return [__(doc.status), colors[doc.status], 'status,=,' + doc.status];
    }
};
