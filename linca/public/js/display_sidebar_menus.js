frappe.provide('linca.utils');

linca.utils.hideArchivesForNonAdmins = function(retryCount = 5) {
    //console.group("[LINCA] Début de hideArchivesForNonAdmins");

    // Sécurité : si user_roles pas encore dispo, on retry avec délai
    if (!Array.isArray(frappe.user_roles)) {
        console.warn("[LINCA] frappe.user_roles est indisponible. Tentative de nouveau dans 200ms...");
        if (retryCount > 0) {
            setTimeout(() => {
                linca.utils.hideArchivesForNonAdmins(retryCount - 1);
            }, 200);
        } else {
            console.error("[LINCA] Échec : frappe.user_roles toujours indisponible après plusieurs tentatives.");
        }
        console.groupEnd();
        return;
    }

    // console.log("Rôles utilisateur:", frappe.user_roles);

    if (!frappe.user_roles.includes("Doctor")) {
        // console.log("L'utilisateur n'est pas un Doctor - menu Archives conservé");
        console.groupEnd();
        return;
    }

    // console.log("Masquage du menu Archives pour le rôle Doctor");

    const hideArchives = () => {
        try {
            const labels = document.querySelectorAll('.sidebar-item-label');
            let found = false;
            labels.forEach(label => {
                if (label.textContent.trim() === "Archives") {
                    const menuItem = label.closest('.desk-sidebar-item');
                    if (menuItem) {
                        menuItem.style.display = 'none';
                        // console.log("Menu Archives masqué avec succès");
                        found = true;
                    }
                }
            });
            return found;
        } catch (e) {
            console.error("[LINCA] Erreur dans hideArchives:", e);
            return false;
        }
    };

    if (hideArchives()) {
        console.groupEnd();
        return;
    }

    const observer = new MutationObserver((mutations, obs) => {
        if (hideArchives()) {
            obs.disconnect();
            // console.log("Observation arrêtée après succès");
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setTimeout(() => {
        observer.disconnect();
        // console.log("Timeout de sécurité déclenché");
        hideArchives();
        console.groupEnd();
    }, 5000);
};

// Initialisation sécurisée
frappe.after_ajax(() => {
    // console.log("[LINCA] frappe.after_ajax déclenché");
    linca.utils.hideArchivesForNonAdmins();
});

// Réexécution après chaque navigation
frappe.router.on('change', () => {
    setTimeout(() => {
        linca.utils.hideArchivesForNonAdmins();
    }, 300);
});
