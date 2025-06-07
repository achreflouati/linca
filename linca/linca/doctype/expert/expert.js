// Copyright (c) 2025, ITESlab and contributors
// For license information, please see license.txt

frappe.ui.form.on('Expert', {
    onload(frm) {
        if (frm.doc.ref) {
            frappe.db.get_doc('Patient et demande', frm.doc.ref).then(doc => {
                frm.set_value('poids', doc.poid_estimé_kg);
            });
        };

        //Set Sections Titles
        lincaUtils.renderSectionTitle(frm, 'processing_conduct', 'Processing Conduct');
        lincaUtils.renderSectionTitle(frm, 'anti_infectives', 'Anti-infectives');
        lincaUtils.renderSectionTitle(frm, 'clinical_practice', 'Clinical Practice');
        lincaUtils.renderSectionTitle(frm, 'additional_requests', 'Additional requests');
        lincaUtils.renderSectionTitle(frm, 'prevention_tips', 'Prevention tips');
        lincaUtils.renderSectionTitle(frm, 'response_methods', 'Response methods');
    }
});