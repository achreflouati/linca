window.lincaUtils = {
    renderSectionTitle(frm, fieldname, title) {
        if (frm.fields_dict[fieldname]) {
            const styleId = "section-title-style";

            if (!document.getElementById(styleId)) {
                const style = document.createElement("style");
                style.id = styleId;
                style.innerHTML = `
                    .clinical-exam-title {
                        background-color: #4eb6f5;
                        color: white;
                        text-align: center;
                        padding: 20px 20px;
                        border-radius: 15px;
                        margin: 10px 0;
                        font-weight: bold;
                        width: 100%;
                        box-sizing: border-box;
                    }
                `;
                document.head.appendChild(style);
            }

            const titleHtml = `<div class="clinical-exam-title">${__(title)}</div>`;
            frm.fields_dict[fieldname].$wrapper.prepend(titleHtml);
        }
    },

    handleExclusiveNoneSelection(frm, triggeredFieldname, noneFieldname, otherFieldnames) {
        // ItesLab: If "None" was selected, uncheck all others
        if (triggeredFieldname === noneFieldname && frm.doc[noneFieldname]) {
            otherFieldnames.forEach(fieldname => {
                if (frm.doc[fieldname]) {
                    frm.set_value(fieldname, 0);
                }
            });
        }

        // ItesLab: If one of the others was selected, uncheck "None"
        if (otherFieldnames.includes(triggeredFieldname) && frm.doc[triggeredFieldname]) {
            if (frm.doc[noneFieldname]) {
                frm.set_value(noneFieldname, 0);
            }
        }
    }
};

console.log("✅ lincaUtils loaded");