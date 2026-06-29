// i18n/locales/auth.js — auth grubu (Login/Register/ForgotPassword/ProfileSetup)
export default {
  tr: {
    // LoginScreen
    "auth.loginTitle": "Giriş Yap",
    "auth.loginSubtitle": "Email ve şifreniz ile giriş yapın",
    "auth.emailLabel": "E-posta",
    "auth.emailPlaceholder": "Email adresinizi girin",
    "auth.passwordLabel": "Şifre",
    "auth.passwordPlaceholder": "Şifrenizi girin",
    "auth.loginButton": "Giriş Yap",
    "auth.forgotPasswordButton": "Şifremi Unuttum",
    "auth.noAccountQuestion": "Hesabın yok mu?",
    "auth.registerButton": "Kayıt Ol",
    "auth.or": "VEYA",
    "auth.testLoginButton": "Test Hesabı ile Gir",
    "auth.testInfoTitle": "Test Bilgileri",
    "auth.testInfoPassword": "Şifre: test123",
    "auth.testInfoNote": "* Firebase'de bu hesabın oluşturulmuş olması gerekir",
    "auth.passwordRequired": "Lütfen şifre giriniz",
    "auth.passwordMinLength": "Şifre en az 6 karakter olmalıdır",
    "auth.userNotFoundTitle": "Kullanıcı bulunamadı",
    "auth.userNotFoundMessage": "Bu email için hesap yok. Lütfen kayıt olun.",
    "auth.invalidCredentialTitle": "Hatalı bilgi",
    "auth.invalidCredentialMessage": "E-posta veya şifre hatalı.",
    "auth.wrongPasswordTitle": "Hatalı şifre",
    "auth.wrongPasswordMessage": "Şifreniz yanlış.",
    "auth.tooManyRequestsTitle": "Çok fazla deneme",
    "auth.tooManyRequestsMessage":
      "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.",
    "auth.loginFailed": "Giriş yapılamadı.",
    "auth.testAccountErrorTitle": "Test Hesabı Hatası",
    "auth.testAccountErrorMessage":
      "Test hesabı bulunamadı. Lütfen Firebase'de test@test.com hesabını oluşturun.",

    // RegisterScreen
    "auth.warning": "Uyarı",
    "auth.registerTitle": "Hesap oluştur",
    "auth.registerSubtitle":
      "Aşağıdaki bilgileri doldurarak hızlıca kayıt olabilirsiniz.",
    "auth.fullNameLabel": "Ad Soyad",
    "auth.fullNamePlaceholder": "Ad Soyad",
    "auth.registerEmailPlaceholder": "E-posta adresi",
    "auth.registerPasswordPlaceholder":
      "Min 8 karakter, büyük/küçük harf, rakam",
    "auth.registerSubmit": "Kayıt ol",
    "auth.backToLogin": "Girişe dön",
    "auth.welcomeTitle": "Hoş geldiniz!",
    "auth.accountCreated": "Hesabınız oluşturuldu.",

    // ForgotPasswordScreen
    "auth.forgotTitle": "Şifreni sıfırla",
    "auth.forgotSubtitle":
      "Kayıtlı e-posta adresinizi girin. Size bir şifre sıfırlama bağlantısı göndereceğiz.",
    "auth.forgotEmailPlaceholder": "E-posta adresiniz",
    "auth.sendResetLink": "Sıfırlama bağlantısı gönder",
    "auth.emailRequired": "Lütfen e-posta adresinizi girin.",
    "auth.emailSentTitle": "E-posta gönderildi",
    "auth.emailSentMessage":
      "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",

    // ProfileSetupScreen
    "auth.profileSetupTitle": "Dijital kartvizitini tamamla",
    "auth.skip": "Geç",
    "auth.fullNameSetupPlaceholder": "Adınızı girin (zorunlu)",
    "auth.companyLabel": "Şirket",
    "auth.companyPlaceholder": "Şirketinizi girin (zorunlu)",
    "auth.jobTitleLabel": "Unvan",
    "auth.jobTitlePlaceholder": "Unvanınızı girin (zorunlu)",
    "auth.complete": "Tamamla",
  },
  en: {
    // LoginScreen
    "auth.loginTitle": "Sign In",
    "auth.loginSubtitle": "Sign in with your email and password",
    "auth.emailLabel": "Email",
    "auth.emailPlaceholder": "Enter your email address",
    "auth.passwordLabel": "Password",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.loginButton": "Sign In",
    "auth.forgotPasswordButton": "Forgot Password",
    "auth.noAccountQuestion": "Don't have an account?",
    "auth.registerButton": "Sign Up",
    "auth.or": "OR",
    "auth.testLoginButton": "Sign in with Test Account",
    "auth.testInfoTitle": "Test Credentials",
    "auth.testInfoPassword": "Password: test123",
    "auth.testInfoNote": "* This account must already exist in Firebase",
    "auth.passwordRequired": "Please enter your password",
    "auth.passwordMinLength": "Password must be at least 6 characters",
    "auth.userNotFoundTitle": "User not found",
    "auth.userNotFoundMessage":
      "There is no account for this email. Please sign up.",
    "auth.invalidCredentialTitle": "Invalid information",
    "auth.invalidCredentialMessage": "Email or password is incorrect.",
    "auth.wrongPasswordTitle": "Wrong password",
    "auth.wrongPasswordMessage": "Your password is incorrect.",
    "auth.tooManyRequestsTitle": "Too many attempts",
    "auth.tooManyRequestsMessage":
      "Too many failed login attempts. Please try again later.",
    "auth.loginFailed": "Could not sign in.",
    "auth.testAccountErrorTitle": "Test Account Error",
    "auth.testAccountErrorMessage":
      "Test account not found. Please create the test@test.com account in Firebase.",

    // RegisterScreen
    "auth.warning": "Warning",
    "auth.registerTitle": "Create account",
    "auth.registerSubtitle": "Fill in the details below to sign up quickly.",
    "auth.fullNameLabel": "Full Name",
    "auth.fullNamePlaceholder": "Full Name",
    "auth.registerEmailPlaceholder": "Email address",
    "auth.registerPasswordPlaceholder":
      "Min 8 characters, upper/lowercase, number",
    "auth.registerSubmit": "Sign up",
    "auth.backToLogin": "Back to sign in",
    "auth.welcomeTitle": "Welcome!",
    "auth.accountCreated": "Your account has been created.",

    // ForgotPasswordScreen
    "auth.forgotTitle": "Reset your password",
    "auth.forgotSubtitle":
      "Enter your registered email address. We'll send you a password reset link.",
    "auth.forgotEmailPlaceholder": "Your email address",
    "auth.sendResetLink": "Send reset link",
    "auth.emailRequired": "Please enter your email address.",
    "auth.emailSentTitle": "Email sent",
    "auth.emailSentMessage":
      "A password reset link has been sent to your email address.",

    // ProfileSetupScreen
    "auth.profileSetupTitle": "Complete your digital business card",
    "auth.skip": "Skip",
    "auth.fullNameSetupPlaceholder": "Enter your name (required)",
    "auth.companyLabel": "Company",
    "auth.companyPlaceholder": "Enter your company (required)",
    "auth.jobTitleLabel": "Job Title",
    "auth.jobTitlePlaceholder": "Enter your job title (required)",
    "auth.complete": "Complete",
  },
};
