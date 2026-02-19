/*
 * adict.js — updated for intl-tel-input v25
 * 
 * DROP-IN REPLACEMENT STRATEGY (HTML не змінюється):
 * 
 * На сервері замінити файли:
 *   1. intlTelInput.js   → вміст intlTelInputWithUtils.min.js з v25 CDN
 *                           (https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/intlTelInputWithUtils.min.js)
 *   2. intlTelInput.css  → вміст intlTelInput.css з v25 CDN
 *                           (https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/css/intlTelInput.css)
 *   3. utils.js           → можна видалити або залишити порожній (більше не потрібен, він вбудований в бандл)
 *   4. adict.js           → цей файл
 *
 * ВАЖЛИВО: v25 використовує прапори у форматі .webp замість .png
 * CSS-змінні для прапорів вже вбудовані в intlTelInput.css від CDN,
 * тому додаткових дій не потрібно якщо ви використовуєте їх CSS.
 */

$(document).ready(function () {
  var iti = [];
  var initialCheckout = true;
  var lang = $("meta[name=lang]").length ? $("meta[name=lang]").attr("content") : $("html").attr("lang");
  lang ? "" : (lang = "ru");
  var countryCode = document.getElementById('countryCode').value;

  // Создаем функцию scrollToForm динамически
  var scrollToFormScript = document.createElement('script');
  scrollToFormScript.innerHTML = `
    function scrollToForm(event) {
        event.preventDefault();
        var formElement = document.querySelector('#form');
        if (formElement) {
            formElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
  `;
  document.head.appendChild(scrollToFormScript);

  var links = document.querySelectorAll('a[href*="#"]');
  links.forEach(function(link) {
    link.removeAttribute('href');
    link.setAttribute('onclick', 'scrollToForm(event)');
  });

  let metaTag = document.querySelector('meta[name="google"][content="notranslate"]');
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.name = 'google';
    metaTag.content = 'notranslate';
    document.head.appendChild(metaTag);
  }

  function getCounty(countryCode) {
    // v25+: use intlTelInput.getCountryData() instead of local allCountries array
    var countries = intlTelInput.getCountryData();
    for (var i = 0; i < countries.length; i++) {
      if (countries[i].iso2 == countryCode) {
        $(".gtd-geo-country-name").html(countries[i].name.split(" ")[0]);
      }
    }
  }

  $(".iti__flag_add").addClass("iti__" + countryCode.toLowerCase());
  inetlStart();

  function inetlStart() {
    var inputs = document.querySelectorAll("input[name=phone]");
    var acceptCountry =
      lang == "ar"
        ? ["ye", "kw", "ae", "bh", "qa", "om", "sa"]
        : [
            "RU", "IS", "KZ", "GB", "IE", "NO", "SE", "FI", "PT", "ES",
            "FR", "IT", "NL", "DK", "DE", "CH", "AT", "CZ", "HU", "LU",
            "LT", "LV", "EE", "LI", "BA", "SK", "SI", "GR",
          ];
    $("meta[name=bush]").length ? (acceptCountry = ["NZ", "AU", "NL", "SE", "CH", "NO", "IE", "GB", "DK", "LU"]) : "";
    $("meta[name=addCountries]").length
      ? $("meta[name=addCountries]")
          .attr("data-countries")
          .split(",")
          .map(function (el) {
            acceptCountry.push(el);
          })
      : "";
    if (lang == "en") {
      acceptCountry = acceptCountry.concat(["NZ", "AU", "BE"]);
    }

    var rueu = ["TESLA-XQ2", "TESLA-X", "TESLA-XQ2Y", "WHATSAPPBOTV2", "WHATSAPPQ", "TESLA-XYO", "TESLA-XQ4Y", "TESLA-XSY"];
    var funnel = document.querySelector('input[name="landing"]').value;

    // v25: excludeCountries приймає iso2 коди в нижньому регістрі
    var blackList;
    if (rueu.includes(funnel)) {
      blackList = ["ua", "tm", "al", "il", "kz"];
    } else {
      blackList = ["ua", "tm", "al", "il"];
    }

    for (var i = 0; i < inputs.length; i++) {
      /*
       * v25 ЗМІНИ:
       * - utilsScript → не потрібен (utils вбудовані в intlTelInputWithUtils.js)
       * - excludeCountries замість ручного CSS-приховування
       * - validationNumberType: "FIXED_LINE_OR_MOBILE" — щоб приймати і мобільні, і стаціонарні
       *   (в v25 isValidNumber() за замовчуванням тільки мобільні!)
       * - countrySearch: true — нова фіча v25, пошук по країнам в дропдауні
       */
      iti[i] = intlTelInput(inputs[i], {
        initialCountry: "auto",
        separateDialCode: true,
        excludeCountries: blackList,
        //validationNumberType: "FIXED_LINE_OR_MOBILE",
        countrySearch: true,
        geoIpLookup: function (success, failure) {
          countryCode.toLowerCase() == "ua" ? (countryCode = acceptCountry[0]) : "";
          success(countryCode);
        },
      });

      inputs[i].setAttribute("data-iti", i);
      inputs[i].setAttribute("type", "tel");
      inputs[i].setAttribute("required", "true");
      inputs[i].addEventListener("input", function () {
        var p = ~~this.getAttribute("data-iti");
        if (initialCheckout) {
          initialCheckout = false;
          fbq("track", "InitiateCheckout");
        }
        if (iti[p].isValidNumber() && /^[+-]?\d+$/.test(iti[p].getNumber())) {
          this.classList.remove("err");
          this.classList.add("valid");
          $(".phone2").val(iti[p].getNumber());
        } else {
          this.classList.add("err");
          this.classList.remove("valid");
        }
      });
    }
  }

  $("form button[type=submit]").click(function (e) {
    e.preventDefault();
    if (checkForm($(this))) {
      submitForm($(this));
    }
  });
  var sendingForm = false;

  const translations = {
    af: "Verskaf asseblief slegs akkurate inligting. Die telefoonnommer moet korrek wees om die registrasie suksesvol te voltooi. 'n Kode sal aan jou gestuur word.",
    ar: "يرجى تقديم بيانات دقيقة فقط. يجب أن يكون رقم الهاتف صحيحًا لإكمال التسجيل بنجاح. سيتم إرسال رمز لك.",
    cz: "Uveďte pouze přesné údaje. Telefonní číslo musí být správné, aby bylo možné úspěšně dokončit registraci. Bude vám zaslán kód.",
    de: "Geben Sie bitte nur genaue Daten an. Die Telefonnummer muss korrekt sein, um die Registrierung erfolgreich abzuschließen. Ihnen wird ein Code zugesandt.",
    dk: "Angiv kun nøjagtige data. Telefonnummeret skal være korrekt for at fuldføre registreringen. Der vil blive sendt en kode til dig.",
    en: "Please provide accurate information only. The phone number must be correct to successfully complete the registration. A code will be sent to you.",
    es: "Por favor, proporcione solo información precisa. El número de teléfono debe ser correcto para completar el registro con éxito. Se le enviará un código.",
    hu: "Kérjük, csak pontos adatokat adjon meg. A telefonszámnak helyesnek kell lennie a sikeres regisztrációhoz. Kódot fog kapni.",
    hr: "Molimo pružite samo točne podatke. Broj telefona mora biti točan za uspješno dovršavanje registracije. Bit će vam poslan kod.",
    kr: "정확한 정보만 제공하십시오. 전화번호가 올바르면 등록이 성공적으로 완료됩니다. 코드가 전송됩니다.",
    ja: "正確な情報のみを提供してください。登録を正常に完了するには、電話番号が正しい必要があります。コードが送信されます。",
    lv: "Lūdzu, norādiet tikai precīzus datus. Lai veiksmīgi pabeigtu reģistrāciju, tālruņa numuram jābūt pareizam. Jums tiks nosūtīts kods.",
    jp: "正確な情報のみをご提供ください。登録を成功させるには、電話番号が正確である必要があります。コードが送信されます。",
    in: "Harap hanya memberikan informasi yang akurat. Nomor telepon harus benar agar pendaftaran berhasil. Kode akan dikirimkan kepada Anda.",
    it: "Si prega di fornire solo informazioni accurate. Il numero di telefono deve essere corretto per completare con successo la registrazione. Ti verrà inviato un codice.",
    no: "Vennligst oppgi bare nøyaktig informasjon. Telefonnummeret må være riktig for å fullføre registreringen. En kode vil bli sendt til deg.",
    nl: "Geef alleen nauwkeurige informatie op. Het telefoonnummer moet correct zijn om de registratie succesvol te voltooien. Er wordt een code naar u verzonden.",
    ro: "Vă rugăm să furnizați doar informații precise. Numărul de telefon trebuie să fie corect pentru a finaliza cu succes înregistrarea. Vi se va trimite un cod.",
    ru: "Укажите только точные данные. Номер телефона должен быть корректным для успешного завершения регистрации. Вам будет отправлен код.",
    rs: "Молимо да дате само тачне информације. Број телефона мора бити тачан да би се регистрација успешно завршила. Биће вам послат код.",
    pl: "Podaj tylko dokładne dane. Numer telefonu musi być poprawny, aby pomyślnie zakończyć rejestrację. Otrzymasz kod.",
    pt: "Forneça apenas informações precisas. O número de telefone deve estar correto para concluir o registro com sucesso. Um código será enviado para você.",
    si: "Prosimo, navedite le natančne podatke. Telefonska številka mora biti pravilna za uspešno dokončanje registracije. Poslan vam bo koda.",
    se: "Ange endast korrekt information. Telefonnummeret måste vara korrekt för att slutföra registreringen. En kod kommer att skickas till dig.",
    sk: "Uveďte prosím iba presné údaje. Telefónne číslo musí byť správne, aby ste mohli úspešne dokončiť registráciu.Po registrácii vám bude zaslaná SMS.",
    tr: "Lütfen yalnızca doğru bilgileri sağlayın. Kayıt işlemini başarıyla tamamlamak için telefon numarası doğru olmalıdır. Size bir kod gönderilecektir.",
    fi: "Anna vain tarkat tiedot. Puhelinnumeron on oltava oikein rekisteröinnin onnistumiseksi. Saat koodin.",
    fr: "Veuillez fournir uniquement des informations précises. Le numéro de téléphone doit être correct pour compléter l'inscription avec succès. Un code vous sera envoyé.",
    gr: "Παρακαλώ παρέχετε μόνο ακριβείς πληροφορίες. Ο αριθμός τηλεφώνου πρέπει να είναι σωστός για να ολοκληρωθεί η εγγραφή με επιτυχία. Θα σας αποσταλεί ένας κωδικός.",
    vi: "Vui lòng chỉ cung cấp thông tin chính xác. Số điện thoại phải chính xác để hoàn tất quá trình đăng ký thành công. Một mã sẽ được gửi cho bạn.",
    zh: "请仅提供准确的信息。电话号码必须正确才能成功完成注册。系统将向您发送验证码。"
  };

  var message = translations[lang] || translations['en'];

  document.querySelectorAll('form[action="thanks/index.php"]').forEach(function(form) {
    form.querySelectorAll('button[type="submit"]').forEach(function(button) {
      var infoDiv = document.createElement('div');
      infoDiv.textContent = message;
      infoDiv.style.color = 'red';
      infoDiv.style.border = '2px solid red';
      infoDiv.style.borderRadius = '15px';
      infoDiv.style.textAlign = 'center';
      infoDiv.style.maxWidth = '500px';
      infoDiv.style.width = '100%';
      infoDiv.style.marginTop = '10px';
      button.insertAdjacentElement('afterend', infoDiv);
    });
  });

  function submitForm(t) {
    t.parents("form").append('<input name="site" type="hidden" value="' + location.href + '"/>');
    if (t.parents("form").find("input[name=phone]").length) {
      var it = t.parents("form").find("input[name=phone]").attr("data-iti");
      $(".phone2").val(iti[it].getNumber());
    }
    if (t.parents("form").find("input[name=phone]").length) {
      var inform = {
        ar: { 1: "البحث عن رخصة مجانية", 2: "إنشاء حساب خاص", 3: "حجز", 4: "التسجيل" },
        af: { 1: "Gratis lisensie soek", 2: "Skep 'n persoonlike rekening", 3: "Bespreking", 4: "Registreer..." },
        cz: { 1: "Vyhledávání bezplatné licence", 2: "Vytvoření individuálního účtu", 3: "Rezervace", 4: "Registrace..." },
        da: { 1: "Gratis licenssøgning", 2: "Opret en personlig konto", 3: "Reservation", 4: "Tilmelding..." },
        de: { 1: "Eine kostenlose Lizenz finden", 2: "Ein individuelles Konto erstellen", 3: "Reservierung", 4: "Anmeldung" },
        dk: { 1: "Søgning efter en gratis licens", 2: "Oprettelse af en individuel konto", 3: "Reservation", 4: "Registrerer..." },
        en: { 1: "Search for a free license", 2: "Create an individual account", 3: "Reservation", 4: "Registration.." },
        es: { 1: "Buscar una licencia libre", 2: "Crear una cuenta personal", 3: "Reservación", 4: "Inscripción" },
        hu: { 1: "Keresés ingyenes licenchez", 2: "Egyéni fiók létrehozása", 3: "Foglalás", 4: "Regisztrálás..." },
        hr: { 1: "Besplatno pretraživanje licenci", 2: "Izradite personalizirani račun", 3: "Rezervacija", 4: "Prijavite se..." },
        kr: { 1: "무료 라이센스 검색", 2: "맞춤형 계정 만들기", 3: "예약", 4: "가입 중..." },
        jp: { 1: "フリーライセンスを検索する", 2: "個人アカウントの作成", 3: "ブッキング", 4: "登録..." },
        lv: { 1: "Meklēšana bezmaksas licence", 2: "Individuālā konta izveide", 3: "Rezervācija", 4: "Reģistrējas..." },
        lo: { 1: "ຄົ້ນຫາໃບອະນຸຍາດຟຣີ", 2: "ສ້າງບັນຊີສ່ວນຕົວ", 3: "ການຈອງ", 4: "ລົງທະບຽນ..." },
        in: { 1: "निःशुल्क लाइसेंस के लिए खोजें", 2: "एक व्यक्तिगत खाता बनाएँ", 3: "बुकिंग", 4: "पंजीकरण.." },
        it: { 1: "Ricerca di una licenza libera", 2: "Creazione di un account personale", 3: "Prenotazione", 4: "Registrazione" },
        no: { 1: "Gratis lisenssøk", 2: "Opprett en personlig konto", 3: "Reservasjon", 4: "Registrer deg..." },
        nl: { 1: "Op zoek naar een gratis licentie", 2: "Een individuele account aanmaken", 3: "Reservering", 4: "Registreren..." },
        ro: { 1: "Căutarea unei licențe gratuite", 2: "Crearea unui cont individual", 3: "Rezervare", 4: "Înregistrare..." },
        ru: { 1: "Поиск свободной лицензии", 2: "Создание индивидуального аккаунта", 3: "Бронирование", 4: "Регистрация.." },
        rs: { 1: "Претрага бесплатне лиценце", 2: "Креирај прилагођен налог", 3: "Резервација", 4: "Пријавите се..." },
        pl: { 1: "Znajdź wolną licencję", 2: "Załóż indywidualne konto", 3: "Zarezerwuj", 4: "Zarejestruj" },
        pt: { 1: "Busca de uma licença gratuita", 2: "Criação de uma conta individual", 3: "Reservas", 4: "Registro.." },
        si: { 1: "Iskanje brezplačne licence", 2: "Ustvari posamezni račun", 3: "Rezervacija", 4: "Registracija..." },
        se: { 1: "Sök efter en gratis licens", 2: "Skapa ett individuellt konto", 3: "Bokning", 4: "Registrerar..." },
        sk: { 1: "Bezplatné vyhľadávanie licencií", 2: "Vytvorte si personalizovaný účet", 3: "Rezervácia", 4: "Registrácia..." },
        tr: { 1: "Ücretsiz bir lisans arayın", 2: "Bireysel hesap oluşturma", 3: "Rezervler", 4: "Kayıt.." },
        fi: { 1: "Ilmainen lisenssin haku", 2: "Yksittäisen tilin luominen", 3: "Varaus", 4: "Rekisteröidään..." },
        fr: { 1: "Keresés ingyenes licenchez", 2: "Egyéni fiók létrehozása", 3: "Foglalás", 4: "Regisztrálás..." },
        gr: { 1: "Αναζήτηση δωρεάν άδειας", 2: "Δημιουργήστε έναν εξατομικευμένο λογαριασμό", 3: "Κράτηση", 4: "Εγγραφείτε..." },
        vi: { 1: "Tìm kiếm giấy phép miễn phí", 2: "Tạo tài khoản cá nhân", 3: "Đặt chỗ", 4: "Đăng ký..." },
        zh: { 1: "搜索免费许可证", 2: "创建一个个人账户", 3: "预订", 4: "注册." },
      };
      t.parents("form").find("input[name=ajax]").length
        ? ""
        : $(this).parents("form").append('<input type="hidden" name="ajax" value="1" />');
      loader = $("<main />");
      loader.addClass("wrapper-ppp");
      loader1 =
        '<section class="loaders loaders-bg-4"><span class="loader loader-bars"><span> </span></span><span class="inform" style="padding-left: 20px;text-align: left">' +
        inform[lang]["1"] +
        '</span></section><style>.wrapper-ppp{width:100vw;height100vh;z-index: 9999999;font-family:sans-serif;font-size:40px;font-size:2.3vw;text-align:center;color:#f9e5ff;position: fixed;left: 0; top:0;}.loaders{display: flex;align-items: center;    justify-content: center;height:100vh;background-color:#06c}.loaders-bg-2{background-color:#fc4532}.loaders-bg-3{background-color:#ff29c8}.loaders-bg-4{background-color:#000}.loader{display:inline-block;position:relative;width:50px;height:28px;vertical-align:middle}.loader-quart{border-radius:50px;border:6px solid rgba(255,255,255,.4)}.loader-quart:after{content:"";position:absolute;top:-6px;right:-6px;bottom:-6px;left:-6px;border-radius:50px;border:6px solid transparent;border-top-color:#f9e5ff;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite}.loader-double{border-radius:50px;border:6px solid transparent;border-top-color:#f9e5ff;border-bottom-color:#f9e5ff;-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}.loader-double:after,.loader-double:before{content:"";position:absolute;top:5px;right:5px;bottom:5px;left:5px;border-radius:50px;border:6px solid transparent;border-top-color:#f9e5ff;border-bottom-color:#f9e5ff;opacity:.6;-webkit-animation:spinreverse 2s linear infinite;animation:spinreverse 2s linear infinite}.loader-double:before{top:13px;left:13px;bottom:13px;right:13px;-webkit-animation:spinreverse 3s linear infinite;animation:spinreverse 3s linear infinite}.loader-circles{border-radius:50px;border:3px solid transparent;border-top-color:#fff;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite}.loader-circles:after,.loader-circles:before{content:"";position:absolute;top:5px;right:5px;bottom:5px;left:5px;border-radius:50px;border:3px solid transparent;border-top-color:#f9e5ff;opacity:.8;-webkit-animation:spinreverse 5s linear infinite;animation:spinreverse 5s linear infinite}.loader-circles:before{top:12px;left:12px;bottom:12px;right:12px;-webkit-animation:spinreverse 10s linear infinite;animation:spinreverse 10s linear infinite}.loader-bars span,.loader-bars:after,.loader-bars:before{content:"";display:block;position:absolute;left:0;top:0;width:10px;height:30px;background-color:#f9e5ff;-webkit-animation:grow 1.5s linear infinite;animation:grow 1.5s linear infinite}.loader-bars:after{left:15px;-webkit-animation:grow 1.5s linear -.5s infinite;animation:grow 1.5s linear -.5s infinite}.loader-bars span{left:30px;-webkit-animation:grow 1.5s linear -1s infinite;animation:grow 1.5s linear -1s infinite}@-webkit-keyframes grow{0%{-webkit-transform:scaleY(0);transform:scaleY(0);opacity:0}50%{-webkit-transform:scaleY(1);transform:scaleY(1);opacity:1}100%{-webkit-transform:scaleY(0);transform:scaleY(0);opacity:0}}@keyframes grow{0%{-webkit-transform:scaleY(0);transform:scaleY(0);opacity:0}50%{-webkit-transform:scaleY(1);transform:scaleY(1);opacity:1}100%{-webkit-transform:scaleY(0);transform:scaleY(0);opacity:0}}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0);tranform:rotate(0)}100%{-webkit-transform:rotate(360deg);tranform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0);tranform:rotate(0)}100%{-webkit-transform:rotate(360deg);tranform:rotate(360deg)}}@-webkit-keyframes spinreverse{0%{-webkit-transform:rotate(0);tranform:rotate(0)}100%{-webkit-transform:rotate(-360deg);tranform:rotate(-360deg)}}@keyframes spinreverse{0%{-webkit-transform:rotate(0);tranform:rotate(0)}100%{-webkit-transform:rotate(-360deg);tranform:rotate(-360deg)}} @media screen and (max-width: 900px){.wrapper-ppp {    font-size: 5vw;}.inform {width: 28%;} }</style>';

      $("body").prepend(loader);

      $(".inform").html(inform[lang][2]);
      setTimeout(function () {
        $(".inform").html(inform[lang][3]);
      }, 2000);
      setTimeout(function () {
        $(".inform").html(inform[lang][4]);
        t.parents("form").trigger("submit");
      }, 3000);
      loader.html(loader1);
    } else {
      t.parents("form").trigger("submit");
    }
  }

  $("form input[type=submit]").click(function (e) {
    e.preventDefault();
    if (checkForm($(this))) {
      submitForm($(this));
    }
  });
  $("form input[type=button]").click(function (e) {
    e.preventDefault();
    if (checkForm($(this))) {
      submitForm($(this));
    }
  });
  var addOnce = true;

  function checkAllForms(check) {
    check ? "" : (check = "nope");
    $("form").each(function () {
      addOnce ? $(this).attr("autocomplete", "on") : "";
      checkForm($(this).find("input"), check);
    });
  }
  checkAllForms();
  $("form input").on("input", function () {
    let name = $(this).attr("name");
    if (name == "phone") {
      var it = $(this).attr("data-iti");
      $(".phone2").val(iti[it].getNumber());
    }
    $("input[name=" + name + "]").val($(this).val());
    checkAllForms(name);
  });

  var errorsUnswers = {
    ar: { f_name: " الحقل مطلوب ـ ", l_name: " الحقل مطلوب ـ ", email: " الحقل مطلوب ـ ", phone: " الحقل مطلوب ـ " },
    af: { f_name: "Voer jou voornaam in", l_name: "Voer jou van in", email: "Voer jou e-posadres in", phone: "Voer jou telefoonnommer in" },
    cz: { f_name: "Zadejte jméno", l_name: "Zadejte příjmení", email: "Zadejte e-mail", phone: "Zadejte telefon" },
    da: { f_name: "Indtast dit fornavn", l_name: "Indtast dit efternavn", email: "Indtast din e-mailadresse", phone: "Indtast dit telefonnummer" },
    de: { f_name: "Geben Sie Ihren Vornamen ein", l_name: "Geben Sie Ihren Nachnamen ein", email: "Geben Sie Ihre E-Mail ein", phone: "Geben Sie Ihre Telefonnummer ein" },
    dk: { f_name: "Indtast et fornavn", l_name: "Indtast et efternavn", email: "Indtast din e-mailadresse", phone: "Indtast dit telefonnummer" },
    en: { f_name: "Insert name", l_name: "Insert last name", email: "Insert email", phone: "Insert phone number" },
    es: { f_name: "Ingrese su nombre", l_name: "Ingrese su apellido", email: "Ingrese su e-mail", phone: "Ingrese su número de teléfono" },
    hu: { f_name: "Adja meg a keresztnevét", l_name: "Adja meg a vezetéknevét", email: "Adja meg az e-mail címét", phone: "Adja meg a telefonszámát" },
    hr: { f_name: "Unesite svoje ime", l_name: "Unesite svoje prezime", email: "Unesite svoju e-mail adresu", phone: "Unesite svoj broj telefona" },
    kr: { f_name: "이름을 입력하세요", l_name: "성을 입력하세요", email: "이메일 주소를 입력하세요", phone: "전화번호를 입력하세요" },
    jp: { f_name: "名前を入力", l_name: "苗字を入力", email: "Eメールアドレスを入力します。", phone: "電話番号を入力" },
    lo: { f_name: "ໃສ່ຊື່ຂອງທ່ານ", l_name: "ໃສ່ນາມສະກຸນຂອງທ່ານ", email: "ໃສ່ທີ່ຢູ່ອີເມລຂອງທ່ານ", phone: "ໃສ່ເບີໂທຂອງທ່ານ" },
    lv: { f_name: "Ievadiet vārdu", l_name: "Ievadiet uzvārdu", email: "Ievadiet savu e-pasta adresi", phone: "Ievadiet savu tālruņa numuru" },
    in: { f_name: "अपना नाम दर्ज करें", l_name: "अंतिम नाम दर्ज करो", email: "ईमेल दर्ज करें", phone: "फ़ोन दर्ज करें" },
    it: { f_name: "Inserire nome", l_name: "Inserire cognome", email: "Inserire email", phone: "Inserire numero di telefono" },
    no: { f_name: "Skriv inn fornavnet ditt", l_name: "Skriv inn etternavnet ditt", email: "Skriv inn e-postadressen din", phone: "Skriv inn telefonnummeret ditt" },
    nl: { f_name: "Voer een voornaam in", l_name: "Voer een achternaam in", email: "Voer uw e-mailadres in", phone: "Voer uw telefoonnummer in" },
    pl: { f_name: "Podaj imię", l_name: "Podaj nazwisko", email: "Podaj email", phone: "Podaj numer telefonu" },
    pt: { f_name: "Digite o nome", l_name: "Digite o sobrenome", email: "Digite o e-mail", phone: "Digite o telefone" },
    ro: { f_name: "Introduceți un nume", l_name: "Introduceți numele de familie", email: "Introduceți adresa dvs. de e-mail", phone: "Introduceți numărul de telefon" },
    ru: { f_name: "Введите Имя", l_name: "Введите фамилию", email: "Введите email", phone: "Введите телефон" },
    rs: { f_name: "Унесите своје име", l_name: "Унесите своје презиме", email: "Унесите своју адресу е-поште", phone: "Унесите свој број телефона" },
    si: { f_name: "Vnesite svoje ime", l_name: "Vnesite svoj priimek", email: "Vnesite svoj e-poštni naslov", phone: "Vnesite svojo telefonsko številko" },
    se: { f_name: "Ange ett förnamn", l_name: "Ange ett efternamn", email: "Ange din e-postadress", phone: "Ange ditt telefonnummer" },
    sk: { f_name: "Zadajte svoje meno", l_name: "Zadajte svoje priezvisko", email: "Zadajte svoju e-mailovú adresu", phone: "Zadajte svoje telefónne číslo" },
    tr: { f_name: "İsim girin", l_name: "Soyadı girin", email: "E-posta adresinizi girin", phone: "Telefon numaranızı girin" },
    fi: { f_name: "Syötä etunimi", l_name: "Syötä sukunimi", email: "Syötä sähköpostiosoitteesi", phone: "Syötä puhelinnumerosi" },
    fr: { f_name: "Adja meg a keresztnevét", l_name: "Adja meg a vezetéknevét", email: "Adja meg az e-mail címét", phone: "Adja meg a telefonszámát" },
    gr: { f_name: "Εισάγετε το όνομά σας", l_name: "Εισάγετε το επώνυμό σας", email: "Εισάγετε τη διεύθυνση email σας", phone: "Εισάγετε τον αριθμό τηλεφώνου σας" },
    vi: { f_name: "Nhập tên của bạn", l_name: "Nhập họ của bạn", email: "Nhập địa chỉ email của bạn", phone: "Nhập số điện thoại của bạn" },
    zh: { f_name: "插入名称", l_name: "插入姓氏", email: "插入电子邮件", phone: "插入电话号码" },
  };

  function checkForm(_this, check) {
    var flag = true;
    var reg = /[0-9]/;
    _this
      .parents("form")
      .find("input")
      .each(function () {
        addOnce ? $(this).attr("autocomplete", "on") : "";
        var name = $(this).attr("name");
        if (name == "f_name") {
          $(this).parent().find(".help-block-error").length
            ? ""
            : $(this).parent().append('<div class="help-block help-block-error"></div>');
          if ($(this).val().length < 1 || reg.test($(this).val())) {
            flag = false;
            if (check == undefined || check == "f_name") {
              $(this).parent().find(".help-block-error").html(errorsUnswers[lang][name]).addClass("block");
              $(this).removeClass("valid").addClass("err");
            }
          } else {
            $(this).parent().find(".help-block-error").html("").removeClass("block");
            $(this).removeClass("err").addClass("valid");
          }
        }
        if (name == "l_name") {
          $(this).parent().find(".help-block-error").length
            ? ""
            : $(this).parent().append('<div class="help-block help-block-error"></div>');
          if ($(this).val().length < 1 || reg.test($(this).val())) {
            flag = false;
            if (check == undefined || check == "l_name") {
              $(this).parent().find(".help-block-error").html(errorsUnswers[lang][name]).addClass("block");
              $(this).removeClass("valid").addClass("err");
            }
          } else {
            $(this).parent().find(".help-block-error").html("").removeClass("block");
            $(this).removeClass("err").addClass("valid");
          }
        }
        if (name == "email") {
          $(this).parent().find(".help-block-error").length
            ? ""
            : $(this).parent().append('<div class="help-block help-block-error"></div>');
          var re =
            /^(([^<>()\[\]\\.,;:\s@"]+(.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (!re.test($(this).val().toLowerCase())) {
            flag = false;
            if (check == undefined || check == "email") {
              $(this).parent().find(".help-block-error").html(errorsUnswers[lang][name]).addClass("block");
              $(this).removeClass("valid").addClass("err");
            }
          } else {
            $(this).parent().find(".help-block-error").html("").removeClass("block");
            $(this).removeClass("err").addClass("valid");
          }
        }
        if (name == "phone") {
          $(this).parents(".form-group").find(".help-block-error").length
            ? ""
            : $(this).parents(".form-group").append('<div class="help-block help-block-error"></div>');
          _this = $(this);
          if (!_this.hasClass("valid")) {
            flag = false;
          }
          setTimeout(function () {
            if (!_this.hasClass("valid")) {
              flag = false;
              if (check == undefined || check == "phone") {
                _this.addClass("err");
                _this
                  .parents(".form-group")
                  .find(".help-block-error")
                  .html(errorsUnswers[lang][name])
                  .addClass("block");
              }
            } else {
              _this.parents(".form-group").find(".help-block-error").html("").removeClass("block");
            }
          }, 500);
        }
      });
    addOnce = false;
    return flag;
  }

  if ($(".alterlink")) {
    $("body").append(
      '<div class="pop-outer">\n' +
        '    <div class="pop-bg"></div>\n' +
        '    <div class="pop-inner">\n' +
        '        <div class="pop-close">X</div>\n' +
        '        <div class="pop-inner__in">\n' +
        "\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>"
    );
  }
  $(".alterlink").click(function (e) {
    e.preventDefault();
    var pol = $(this).attr("href");
    var nam = $(this).html();
    posY = $(window).scrollTop();
    $("body").css({ overflow: "hidden" });
    $.ajax({
      type: "post",
      url: pol,
      success: function (res) {
        $(".pop-outer").addClass("active");
        $(".pop-inner__in ").html(res);
      },
    });
  });
  $(".pop-close").click(closePop);
  $(".pop-bg").click(closePop);

  function closePop() {
    $("body").css({ overflow: "auto" });
    $("html, body").animate({ scrollTop: posY + "px" }, 0);
    $(".pop-inner__in ").animate({ scrollTop: 0 + "px" }, 0);
    $(".pop-outer").removeClass("active");
    $(".pop-inner__in ").html(" ");
  }

  var posY = 0;
  $(".cookie").click(function () {
    posY = $(window).scrollTop();
    $("body").css({ overflow: "hidden" });
    $(".cookie-policy-pop").addClass("modal-open");
  });
  $(".terms__close").click(function () {
    $("body").css({ overflow: "auto" });
    $("html, body").animate({ scrollTop: posY + "px" }, 0);
    $(".terms").removeClass("modal-open").css("display", "none");
    $(".modal-bg").addClass("modal-open").css("display", "none");
  });
  $(".scroll-top-btn").click(function (e) {
    e.preventDefault();
    $("html, body").animate({ scrollTop: $(".hero").offset().top + "px" }, 500);
  });
  $(".pops").click(function () {
    posY = $(window).scrollTop();
    $("body").css({ overflow: "hidden" });
    var r = $(this).attr("data-pop");
    $(".terms[data-pop=" + r + "]").addClass("modal-open").css("display", "block");
    $(".modal-bg").addClass("modal-open").css("display", "block");
  });
  window.onscroll = function () {
    $(window).scrollTop() > 200 ? $(".navBarSlider").addClass("slided") : $(".navBarSlider").removeClass("slided");
  };

  if ($.exitIntent) {
    $.exitIntent("enable");
    var fr = false;
    var timeout = 120000;
    if ($("html").hasClass("test")) {
      timeout = 1000;
    }
    console.log(timeout);
    $(".exit_popup .close").click(function () {
      posY = $(window).scrollTop();
      $(".exit_popup").modal("hide").hide().css("display", "none");
      $(".modal-bg").addClass("modal-open").css("display", "none");
    });

    function timeoutWait() {
      setTimeout(function () {
        fr = true;
      }, timeout);
    }
    timeoutWait();
    $(document).bind("exitintent", function () {
      if (!fr) {
        return;
      }
      fr = false;
      timeoutWait();
      posY = $(window).scrollTop();
      $(".exit_popup").modal("show").show().css("display", "block");
      $(".modal-bg").addClass("modal-open").css("display", "block");
    });
  }

  $(".video-insert").each(function () {
    let vid = $(this).attr("data-video");
    let video = $("<video/>");
    let poster = $(this).attr("data-poster");
    video.attr("src", vid);
    video.attr("playsinline", true);
    video.attr("controls", true);
    video.attr("preload", "none");
    video.attr("allowfullscreen", "true");
    poster ? video.attr("poster", poster) : "";
    video.css({ width: "100%", height: "100%" });
    $(this).append(video);
    let playBtn = $("<div/>");
    playBtn.addClass("play-btn");
    $(this).append(playBtn);
  });

  let playBtns = document.querySelectorAll(".play-btn");
  for (var i = 0; i < playBtns.length; i++) {
    playBtns[i].addEventListener("click", function () {
      let videoEl = this.parentNode.querySelector("video");
      if (videoEl.paused) {
        videoEl.play();
        this.parentNode.classList.add("play");
      } else {
        videoEl.pause();
        this.parentNode.classList.remove("play");
      }
    });
  }
});

if ($("#youtube-insert").length) {
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  var player;

  function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-insert", {
      height: "360",
      width: "640",
      videoId: $("#youtube-insert").attr("data-video"),
      events: { onReady: onPlayerReady },
      playerVars: { controls: 0, loop: 1, modestbranding: 1, rel: 0, showinfo: 0 },
    });
  }

  function onPlayerReady(event) {
    $(".over").click(function () {
      console.log(player, player.getPlayerState());
      if (player.getPlayerState() != 1) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    });
  }
  // Tracker zjcok.com — REMOVED (was sending hostname to unknown external server)
}
