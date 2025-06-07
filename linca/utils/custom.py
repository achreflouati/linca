import frappe
from frappe.website.utils import get_home_page, is_signup_disabled
from frappe.utils import escape_html
from frappe import _  # Importation de _() pour la traduction des messages

@frappe.whitelist(allow_guest=True)
def get_services():
    """Return list of services for registration"""
    try:
        return frappe.get_all("Service", 
                           fields=["name", "name1"],
                           order_by="name")
    except Exception as e:
        frappe.log_error(f"Failed to fetch services: {str(e)}", "get_services")
        return []

@frappe.whitelist(allow_guest=True)
def get_institutions():
    """Return list of institutions for registration"""
    try:
        return frappe.get_all("Institution",
                           fields=["name", "name1"],
                           order_by="name")
    except Exception as e:
        frappe.log_error(f"Failed to fetch institutions: {str(e)}", "get_institutions")
        return []

@frappe.whitelist(allow_guest=True, methods=['POST'])

def sign_up(email: str, full_name: str, grade: str, phone_number: str, service: str, role: str, institution: str, redirect_to: str) -> tuple[int, str]:
    """Fonction d'inscription étendue avec des champs personnalisés"""
    
    # Vérification si l'inscription est désactivée
    if is_signup_disabled():
        frappe.throw(_("Sign Up is disabled"), title=_("Not Allowed"))

    # Vérification si l'utilisateur existe déjà
    user = frappe.db.get("User", {"email": email})
    if user:
        if user.enabled:
            return 0, _("Already Registered")
        else:
            return 0, _("Registered but disabled")
    
    # Limite de création d'utilisateurs
    if frappe.db.get_creation_count("User", 60) > 300:
        frappe.respond_as_web_page(
            _("Temporarily Disabled"),
            _("Too many users signed up recently, so the registration is disabled. Please try back in an hour"),
            http_status_code=429,
        )

    # Création de l'utilisateur
    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": escape_html(full_name),
        "enabled": 1,  # Utilisateur activé
        "user_type": "Website User",
        "grade": grade,
        "phone_number": phone_number,
        "service": service,
        "institution": institution
    })

    user.flags.ignore_permissions = True  # Ignorer les permissions
    user.flags.ignore_password_policy = True  # Ignorer la politique de mot de passe
    user.insert()  # Insertion dans la base de données
    # if role == "Doctor":
    #     user.add_roles("Doctor")
    # elif role == "Expert":
    #     user.add_roles("System Manager")
    
    # Ajout du rôle par défaut
    default_role = frappe.db.get_single_value("Portal Settings", "default_role")
    if default_role:
        user.add_roles(default_role)

    # Si un redirect est spécifié, redirige après la connexion
    if redirect_to:
        frappe.cache.hset("redirect_after_login", user.name, redirect_to)

    # Vérification de l'envoi de l'email
    if user.flags.email_sent:
        return 1, _("Please check your email for verification")
    else:
        return 2, _("Please ask your administrator to verify your sign-up")
