import { COUNTRIES } from './countries.js';

/**
 * Optimized Contact Us Component
 */
export default function decorate(block) {
  const rows = [...block.children];

  /* ================================
     1. Dynamic Configuration
  ================================ */

  const getValue = (idx) => rows[idx]?.textContent?.trim() || "";
  const getHTML = (idx) => rows[idx]?.innerHTML?.trim() || "";

  const config = {
    sectionTitle: block.dataset.sectiontitle || getValue(0) || "Corporate Office",
    companyName: block.dataset.companyname || getValue(1) || "GMR Group",
    address: block.dataset.address || getHTML(2) || "New Udaan Bhawan, New Delhi, India.",
    phone: block.dataset.phone || getValue(3) || "+9111 4253 2600",
    email: block.dataset.email || getValue(4) || "info@gmrgroup.in",
    socialTitle: block.dataset.socialtitle || getValue(5) || "Connect with us",
    instagramUrl: block.dataset.instagramurl || getValue(6),
    xUrl: block.dataset.xurl || getValue(7),
    linkedinUrl: block.dataset.linkedinurl || getValue(8),
    youtubeUrl: block.dataset.youtubeurl || getValue(9),
    whatsappUrl: block.dataset.whatsappurl || getValue(10),
    facebookUrl: block.dataset.facebookurl || getValue(11),
    submitLabel: block.dataset.submitlabel || "Submit",
    successMessage: block.dataset.successmessage || "Success!",
    mapEmbedUrl: block.dataset.mapembedurl || getValue(12) || "",
  };

  rows.forEach((r) => (r.style.display = "none"));

  /* ================================
     2. Build UI Data
  ================================ */

  /* ================================
   SVG ICONS (AEM SAFE INLINE SVG)
================================ */

  const SOCIAL_SVGS = {
    instagram: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  `,

    x: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2H22L14.5 10.5L23 22H16.5L11 14.5L4.5 22H0L8 13L0 2H6.7L11.7 8.5L18 2Z"/>
    </svg>
  `,

    linkedin: `

<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.67927 25.3411H0.420321V8.40335H5.67927V25.3411ZM3.04675 6.0938C2.44543 6.09377 1.85757 5.91582 1.35719 5.58235C0.856813 5.24888 0.466294 4.7748 0.234813 4.21983C0.00333172 3.66485 -0.0587601 3.05379 0.0563569 2.4636C0.171474 1.8734 0.458652 1.33047 0.881726 0.903163C1.3048 0.475858 1.84485 0.183292 2.43387 0.0623086C3.02289 -0.0586751 3.63454 -0.00266646 4.19179 0.223281C4.74904 0.449229 5.22698 0.835012 5.56541 1.33205C5.90384 1.82908 6.08764 2.41515 6.09365 3.01643C6.09529 3.82784 5.77577 4.60692 5.20488 5.18351C4.63399 5.76011 3.85813 6.08737 3.04675 6.0938ZM25.3623 25.3411H20.1094V17.0962C20.1094 15.1309 20.0698 12.6111 17.3672 12.6111C14.6646 12.6111 14.2136 14.744 14.2136 16.953V25.3411H8.97297V8.40335H14.0156V10.7129H14.0887C14.5922 9.84827 15.3209 9.13653 16.1972 8.65358C17.0735 8.17064 18.0644 7.93462 19.0643 7.9707C24.3872 7.9707 25.3653 11.4746 25.3653 16.0297L25.3623 25.3411Z" fill="#0172B1"/>
</svg>

  `,

    youtube: `

<svg width="30" height="21" viewBox="0 0 30 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.4672 3.20519C28.3027 2.58653 27.9787 2.02192 27.5274 1.56788C27.0762 1.11384 26.5136 0.786307 25.8959 0.618064C22.1277 0.164716 18.3337 -0.0396259 14.5385 0.00636802C10.7425 -0.0397424 6.94757 0.1646 3.17845 0.618064C2.56081 0.786307 1.99821 1.11384 1.54696 1.56788C1.09571 2.02192 0.771642 2.58653 0.607207 3.20519C0.188482 5.52942 -0.0145155 7.88737 0.000806621 10.249C-0.0145155 12.6106 0.188482 14.9685 0.607207 17.2927C0.772974 17.9061 1.0982 18.4647 1.54982 18.9117C2.00144 19.3587 2.56336 19.6781 3.17845 19.8375C6.94757 20.291 10.7425 20.4953 14.5385 20.4492C18.3345 20.4953 22.1295 20.291 25.8986 19.8375C26.5137 19.6781 27.0756 19.3587 27.5272 18.9117C27.9788 18.4647 28.3041 17.9061 28.4698 17.2927C28.8886 14.9685 29.0916 12.6106 29.0762 10.249C29.0916 7.88737 28.8859 5.52942 28.4672 3.20519ZM11.5648 14.5706V5.92473L19.1646 10.249L11.5648 14.5706Z" fill="#FF0000"/>
</svg>

  `,

    whatsapp: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 3.9A11.8 11.8 0 0012.1 1C6 1 1 6 1 12c0 2.1.6 4.1 1.7 5.9L1 23l5.3-1.7A11.9 11.9 0 0012.1 23C18.2 23 23 18 23 12c0-3.2-1.3-6.2-3-8.1zM12.1 21c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.1 1 1-3-.3-.5A9.9 9.9 0 1122 12c0 5-4 9-9.9 9zm5.3-7.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-1.7-.8-2.9-1.4-4-3.2-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6s-.7-1.6-1-2.2c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.9.6.8.3 1.5.3 2 .2.6-.1 1.8-.7 2-1.3.3-.7.3-1.2.2-1.3-.1-.2-.3-.2-.6-.4z"/>
    </svg>
  `,

    facebook: `

<svg width="20" height="31" viewBox="0 0 20 31" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.0196 17.2921L16.8711 11.735H11.5398V8.12799C11.5032 7.71433 11.5598 7.29774 11.7053 6.90881C11.8509 6.51988 12.0817 6.1685 12.3809 5.88047C12.68 5.59245 13.0399 5.3751 13.434 5.24439C13.8282 5.11369 14.2466 5.07294 14.6586 5.12515H17.0999V0.39508C15.6757 0.165061 14.2366 0.0396074 12.794 0.019726C11.8021 -0.0560839 10.8056 0.0872052 9.87521 0.439439C8.94481 0.791672 8.10327 1.34423 7.41022 2.05795C6.71718 2.77167 6.18959 3.62909 5.86485 4.56944C5.54011 5.50979 5.42617 6.51005 5.53109 7.49934V11.735H0.648438V17.2921H5.53109V30.7194H11.5398V17.2921H16.0196Z" fill="#1877F2"/>
</svg>
  `
  };

  const socialLinks = [
    { id: "instagram", url: config.instagramUrl },
    { id: "x", url: config.xUrl },
    { id: "linkedin", url: config.linkedinUrl },
    { id: "youtube", url: config.youtubeUrl },
    { id: "whatsapp", url: config.whatsappUrl },
    { id: "facebook", url: config.facebookUrl },
  ]
    .filter(l => l.url)
    .map(l => ({
      ...l,
      icon: SOCIAL_SVGS[l.id] || ""
    }));


  const enquiryOptions = [
    "General Enquiry",
    "Business Partnership",
    "Career Opportunities",
    "Media & Press",
    "Other",
  ]
    .map(
      (opt) =>
        `<option value="${opt.toLowerCase().replace(/\s/g, "_")}">${opt}</option>`
    )
    .join("");

  const countryOptions = COUNTRIES.map(
    (c) => `<option value="${c.value}">${c.label}</option>`
  ).join("");

  /* ================================
     3. Render Markup (UPDATED STRUCTURE)
  ================================ */

  block.innerHTML = `
    <section class="contact-section spacer pb-0">
      <div class="container">
        <div class="contact-wrapper">

          <!-- LEFT SIDE -->
          <div class="contact-left">

            ${config.sectionTitle
      ? `<h2 class="contact-title">${config.sectionTitle}</h2>`
      : ""
    }

            ${config.companyName
      ? `<div class="contact-company">${config.companyName}</div>`
      : ""
    }

            ${config.address
      ? `<div class="contact-address">
                <span>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 8.51464C5 4.9167 8.13401 2 12 2C15.866 2 19 4.9167 19 8.51464C19 12.0844 16.7658 16.2499 13.2801 17.7396C12.4675 18.0868 11.5325 18.0868 10.7199 17.7396C7.23416 16.2499 5 12.0844 5 8.51464Z" stroke="#333333" stroke-width="1.5"/>
<path d="M14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z" stroke="#333333" stroke-width="1.5"/>
<path d="M20.9605 15.5C21.6259 16.1025 22 16.7816 22 17.5C22 19.9853 17.5228 22 12 22C6.47715 22 2 19.9853 2 17.5C2 16.7816 2.37412 16.1025 3.03947 15.5" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
</svg></span>
                ${config.address}
                </div>`
      : ""
    }

            ${config.phone || config.email
      ? `
              <div class="contact-meta">

                ${config.phone
        ? `
                  <div class="contact-item">
                    <span>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14 2C14 2 16.2 2.2 19 5C21.8 7.8 22 10 22 10" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
<path d="M14.207 5.53564C14.207 5.53564 15.197 5.81849 16.6819 7.30341C18.1668 8.78834 18.4497 9.77829 18.4497 9.77829" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
<path d="M10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90533 10.1147 9.8278C10.1147 9.8278 8.99578 10.9467 11.0245 12.9755C13.0532 15.0042 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C14.1588 20.0658 10.9183 19.5829 7.6677 16.3323C4.41713 13.0817 3.93421 9.84122 4.00655 7.93309C4.04952 6.7996 4.7008 5.77423 5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617Z" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
</svg>
</span>
                    <a href="tel:${config.phone.replace(/\s+/g, "")}">
                      ${config.phone}
                    </a>
                  </div>
                `
        : ""
      }

                ${config.email
        ? `
                  <div class="contact-item">
                    <span>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 6.10156C19.3001 6.22944 20.1752 6.51846 20.8284 7.17164C22 8.34322 22 10.2288 22 14.0001C22 17.7713 22 19.6569 20.8284 20.8285C19.6569 22.0001 17.7712 22.0001 14 22.0001H10C6.22876 22.0001 4.34315 22.0001 3.17157 20.8285C2 19.6569 2 17.7713 2 14.0001C2 10.2288 2 8.34322 3.17157 7.17164C3.82475 6.51846 4.69989 6.22944 6 6.10156" stroke="#333333" stroke-width="1.5"/>
<path d="M10 6H14" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
<path d="M11 9H13" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
<path d="M8.1589 11.7991L7.43926 11.1994C6.73152 10.6096 6.37764 10.3147 6.18882 9.91156C6 9.50842 6 9.04778 6 8.1265V7C6 4.64298 6 3.46447 6.73223 2.73223C7.46447 2 8.64298 2 11 2H13C15.357 2 16.5355 2 17.2678 2.73223C18 3.46447 18 4.64298 18 7V8.1265C18 9.04778 18 9.50842 17.8112 9.91156C17.6224 10.3147 17.2685 10.6096 16.5607 11.1994L15.8411 11.7991C14.0045 13.3296 13.0861 14.0949 12 14.0949C10.9139 14.0949 9.99553 13.3296 8.1589 11.7991Z" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
<path d="M6 10L8.1589 11.7991C9.99553 13.3296 10.9139 14.0949 12 14.0949C13.0861 14.0949 14.0045 13.3296 15.8411 11.7991L18 10" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
</svg></span>
                    <a href="mailto:${config.email}">
                      ${config.email}
                    </a>
                  </div>
                `
        : ""
      }

              </div>
            `
      : ""
    }

            ${socialLinks.length
      ? `
              <div class="contact-social">
                ${config.socialTitle
        ? `<p>${config.socialTitle}</p>`
        : ""
      }
                <div class="social-links">
                  ${socialLinks
        .map(
          (l) => `
                    <a href="${l.url}" target="_blank" aria-label="${l.id}">
                      ${l.icon}
                    </a>
                  `
        )
        .join("")}
                </div>
              </div>
            `
      : ""
    }

          </div>

          <!-- RIGHT SIDE FORM -->
          <div class="contact-right">
            <form class="contact-form" id="contactForm" novalidate>

              <div class="row">
                <div class="col-md-6 mb-4">
                  <label class="mb-2">Enquiry*</label>
                  <select id="enquiry" name="enquiry" required>
                    <option value="">Select enquiry type</option>
                    ${enquiryOptions}
                  </select>
                </div>
                <div class="col-md-6 mb-4">
                  <label class="mb-2">Country*</label>
                  <select id="country" name="country" required>
                    <option value="">Select country</option>
                    ${countryOptions}
                  </select>
                </div>
                <div class="col-md-6 mb-4">
                  <label class="mb-2">First Name*</label>
                  <input type="text" id="firstName" name="firstName" placeholder="Enter your first name..." required>
                </div>
                <div class="col-md-6 mb-4">
                  <label class="mb-2">Last Name</label>
                  <input type="text" id="lastName" name="lastName" placeholder="Enter your last name...">
                </div>

                <div class="col-md-6 mb-4">
                  <label class="mb-2">Mobile No.*</label>
                  <input type="tel" id="mobile" name="mobile" placeholder="Enter your mobile no..." required>
                </div>
                <div class="col-md-6 mb-4">
                  <label class="mb-2">Email I’D*</label>
                  <input type="email" id="email" name="email" placeholder="Enter your email ID..." required>
                </div>
                <div class="col-md-12">
                  <label class="mb-2">Message*</label>
                  <textarea id="message" name="message" placeholder="Enter your message..." required></textarea>
                </div>
                <div class="col-md-12">
                  <button type="submit" class="btn btn-primary">
                    ${config.submitLabel}
                  </button>
                </div>

              <div class="form-status" aria-live="polite" style="display:none"></div>

            </form>
          </div>

        </div>
      </div>
    </section>

    ${config.mapEmbedUrl
      ? `
      <div class="contact-map">
        <iframe src="${config.mapEmbedUrl}" loading="lazy" allowfullscreen></iframe>
      </div>
    `
      : ""
    }
  `;

  /* ================================
     4. Logic & Validation (UNCHANGED)
  ================================ */

  const form = block.querySelector("#contactForm");
  const status = block.querySelector(".form-status");
  const submitBtn = block.querySelector('[type="submit"]');
  const mobileInput = block.querySelector("#mobile");

  function updateStatus(msg, isError = true) {
    status.textContent = msg;
    status.style.display = "block";
    status.className = isError ? "form-status error" : "form-status success";
  }

  const loadLib = (url, isCss = false) => {
    const sel = isCss ? `link[href="${url}"]` : `script[src="${url}"]`;
    if (document.querySelector(sel)) return Promise.resolve();

    return new Promise((res, rej) => {
      const el = document.createElement(isCss ? "link" : "script");
      if (isCss) {
        el.rel = "stylesheet";
        el.href = url;
      } else {
        el.src = url;
        el.async = true;
      }
      el.onload = res;
      el.onerror = rej;
      document.head.appendChild(el);
    });
  };

  let iti;

  Promise.all([
    loadLib(
      "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css",
      true
    ),
    loadLib(
      "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/intlTelInput.min.js"
    ),
  ]).then(() => {
    iti = window.intlTelInput(mobileInput, {
      initialCountry: "auto",
      separateDialCode: true,
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
      geoIpLookup: (cb) =>
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((d) => cb(d.country_code))
          .catch(() => cb("in")),
    });
  });

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    const getLabel = () => el.closest("div")?.querySelector("label");

    el.addEventListener("blur", () => {
      let isInvalid = !el.checkValidity();

      if (el === mobileInput && iti && !iti.isValidNumber()) {
        isInvalid = true;
      }

      el.classList.toggle("invalid", isInvalid);

      const label = getLabel();
      if (label) label.classList.toggle("error", isInvalid);
    });

    el.addEventListener("input", () => {
      el.classList.remove("invalid");

      const label = getLabel();
      if (label) label.classList.remove("error");
    });

    /* For <select> elements, also clear on change */
    if (el.tagName === "SELECT") {
      el.addEventListener("change", () => {
        el.classList.remove("invalid");
        const label = getLabel();
        if (label) label.classList.remove("error");
      });
    }
  });

  /* Clear phone error as soon as the user changes the number or country */
  mobileInput.addEventListener("change", () => {
    if (iti && iti.isValidNumber()) {
      mobileInput.classList.remove("invalid");
      const label = mobileInput.closest("div")?.querySelector("label");
      if (label) label.classList.remove("error");
    }
  });


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phoneInvalid = iti && !iti.isValidNumber();

    if (!form.checkValidity() || phoneInvalid) {
      /* Highlight all native-invalid fields */
      form.querySelectorAll(":invalid").forEach((i) => {
        i.classList.add("invalid");
        const label = i.closest("div")?.querySelector("label");
        if (label) label.classList.add("error");
      });

      /* Highlight phone field separately (ITI wraps it, so :invalid may miss it) */
      if (phoneInvalid) {
        mobileInput.classList.add("invalid");
        const phoneLabel = mobileInput.closest("div")?.querySelector("label");
        if (phoneLabel) phoneLabel.classList.add("error");
      }

      updateStatus("Please fill all the highlighted fields correctly.");

      /* Scroll to the first highlighted field so the user can see it */
      const firstInvalid = form.querySelector(".invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus({ preventScroll: true });
      }

      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
    status.style.display = "none";

    const fd = new FormData(form);
    const countryObj = COUNTRIES.find((c) => c.value === fd.get("country"));

    const payload = {
      enquiryType: fd.get("enquiry"),
      country: countryObj?.label || fd.get("country"),
      country_code: `+${iti?.getSelectedCountryData().dialCode || ""}`,
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName") || "",
      mobileNo:
        iti
          ?.getNumber(window.intlTelInputUtils?.numberFormat.NATIONAL)
          .replace(/\D/g, "") || fd.get("mobile"),
      email: fd.get("email"),
      message: fd.get("message"),
    };

    try {
      const gmrPromise = fetch(
        "http://13.200.106.168:4000/api/enquiry/save-enquery",
        {
          method: "POST",
          headers: {
            Authorization:
              "U2FsdGVkX1+IAunex0zJueoZQpRBfpUm/DSQSMufK69HpTEh4abfdnhz0fQ+jbSmPrqojCZOhYZ6/mvA28aQxw",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      // SMTP email via Adobe IO Runtime — temporarily disabled
      // const adobePromise = fetch(
      //   "https://3842504-emailer-default.adobeioruntime.net/api/v1/web/eds-smtp-mailer/send-mail",
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       name: `${payload.firstName} ${payload.lastName}`.trim(),
      //       email: payload.email,
      //       message: `NEW SUBMISSION\nEnquiry: ${payload.enquiryType}\nCountry: ${payload.country}\nPhone: ${payload.country_code}${payload.mobileNo}\n\nMessage:\n${payload.message}`,
      //     }),
      //   }
      // );

      const gmrResponse = await gmrPromise;
      const anySuccess = gmrResponse.ok || gmrResponse.status === 200;

      if (anySuccess) {
        window.location.href = "/en/thankyou";
      } else {
        throw new Error("Service temporarily unavailable.");
      }
    } catch (err) {
      updateStatus(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = config.submitLabel;
    }
  });
}
