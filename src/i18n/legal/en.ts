import type { LegalText } from "./ar";

const en: LegalText = {
  ui: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    cookies: "Cookie Policy",
    updatedLabel: "Last updated",
    updatedDate: "6 November 2026",
    contents: "Contents",
    note: "This text describes what the site actually does today and is not legal advice. If you have a question, write to {email}.",
    openCookieSettings: "Cookie settings",
    crumb: "Qawsan",
  },

  privacy: {
    metaTitle: "Privacy Policy | Qawsan Studio",
    metaDescription: "How the Qawsan website collects, uses and protects your data, and what your rights are and how to use them.",
    title: "Privacy Policy",
    intro: "This page explains which data we collect from qawsan.website and why, who we share it with, and how you can control it.",
    sections: [
      {
        id: "who",
        title: "Who we are",
        paragraphs: [
          "Qawsan Studio is an individual project run by its founder from Türkiye. It builds websites and custom systems and designs user interfaces and digital identities. It is not registered as a company yet, and it is the party responsible for the data described in this policy.",
          "Privacy contact: {email}",
        ],
      },
      {
        id: "data",
        title: "Data we collect",
        paragraphs: ["We collect only what each purpose below needs:"],
        list: [
          "“Start your project” form: your name, company (optional), email, WhatsApp number, project type, the description, features and references you write, budget and timeline ranges, preferred contact method, and your consent to processing.",
          "Review form: your name, role or company (optional), star rating, review text, page language, and your consent to publish.",
          "Protecting the forms from abuse: a hidden field, how long the form took to fill in, and your IP address, which we use briefly to limit attempts and do not keep in our records.",
          "Technical data that our hosting provider receives on every visit, such as IP address, browser type and the page requested, to run and protect the site.",
          "Measurement data, which is optional and collected only with your consent: pages you visit, approximate country, device and browser, how you interact with the site, and recordings of your browsing in which form inputs are masked. Details are in the Cookie Policy.",
        ],
        after: ["The site has no visitor accounts and takes no payments, and we never ask for card or identity-document details."],
      },
      {
        id: "use",
        title: "How we use your data",
        list: [
          "To reply to your project request, contact you the way you chose and prepare a suitable proposal.",
          "To publish your review on the site as soon as you send it, with the name, role and text you wrote. We can hide or delete it, and you can ask us to.",
          "To understand how the site is used and improve it (with your consent).",
          "To measure how our Facebook and Instagram ads perform (with your consent).",
          "To protect the site and forms from spam and abuse.",
        ],
      },
      {
        id: "basis",
        title: "Basis for processing",
        paragraphs: [
          "We process form data because you asked us to and on your explicit consent, which you give by ticking the consent box before sending. We process measurement and marketing data on your consent in the cookie dialog, which you can withdraw at any time. Basic technical data is processed to run and protect the site.",
        ],
      },
      {
        id: "providers",
        title: "Services we rely on",
        paragraphs: ["We use the following providers. Your data reaches them only as far as needed to do their job:"],
        list: [
          "Vercel: hosts the site and runs the functions that receive the forms.",
          "Google Sheets (through Google’s API): stores the project requests sent from the form.",
          "Resend: sends us an email notification that includes the content of your request or review.",
          "Supabase: the database that holds reviews and the projects shown, and handles the administrator’s sign-in.",
          "Google Fonts: loads the site’s fonts from Google’s servers, which receive your IP address when the page loads.",
          "Google Analytics, Microsoft Clarity and Meta Pixel: optional tools that run only with your consent.",
        ],
        after: ["Links to Instagram, LinkedIn and similar services lead to independent services with their own policies."],
      },
      {
        id: "sharing",
        title: "Sharing",
        paragraphs: [
          "We do not sell your data. We share it only with the providers above to run the site and handle your request, or when the law requires it. A review you send becomes public on the site.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep data",
        paragraphs: [
          "We do not keep data longer than needed. We keep project requests for as long as necessary to reply, deliver the project and follow up with you, then delete them or make them anonymous. A review stays published until you ask us to remove it or we decide to hide it. Measurement data follows the retention settings of each tool. You can ask us to delete your data at any time.",
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "The site is served over an encrypted connection (HTTPS), service keys stay on the server and not in the browser, and access to requests and reviews is limited to the administrator. Still, no method of transfer or storage is completely secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: ["Depending on the law that applies to you, you can usually:"],
        list: [
          "find out whether we process your data and see it;",
          "have inaccurate data corrected;",
          "ask us to delete or destroy your data;",
          "withdraw your consent at any time, without affecting what happened before;",
          "object to processing or ask us to restrict it where that applies;",
          "complain to the data protection authority in your country, including Türkiye’s Personal Data Protection Authority (KVKK).",
        ],
      },
      {
        id: "request",
        title: "How to make a request",
        paragraphs: [
          "Write to {email} and say what you are asking for, along with the email or WhatsApp number you used in the form so we can find your data. We may ask you to confirm your identity first, and we will reply as soon as we can.",
        ],
      },
      {
        id: "transfers",
        title: "Transfers across borders",
        paragraphs: [
          "The servers of the providers above may be in countries other than yours or Türkiye. By using the site, sending the forms or accepting cookies, your data may be transferred and processed there, and we rely on those providers’ safeguards.",
        ],
      },
      {
        id: "updates",
        title: "Updates to this policy",
        paragraphs: [
          "We may update this policy when the site’s practices or tools change. The date of the last update is at the top of the page and the new version is published here. If a change is significant, we will say so on the site.",
        ],
      },
    ],
  },

  terms: {
    metaTitle: "Terms of Use | Qawsan Studio",
    metaDescription: "The terms that govern the use of the Qawsan Studio website, its content and the services it presents.",
    title: "Terms of Use",
    intro: "By using qawsan.website you agree to these terms. If you do not agree, please do not use the site.",
    sections: [
      {
        id: "about",
        title: "About the site and services",
        paragraphs: [
          "The site is the public face of Qawsan Studio, an individual project not yet registered as a company, which offers website development, custom systems and platforms, and UI/UX and digital identity design.",
          "The site shows our work and our blog and lets you send a project request or a review.",
        ],
      },
      {
        id: "scope",
        title: "These terms and project agreements",
        paragraphs: [
          "These are terms for using the website only. They do not replace the project agreement we sign with a client. Sending a project request creates no obligation for us or for you, and work starts only under a written agreement that sets the scope, price and timeline.",
        ],
      },
      {
        id: "use",
        title: "Permitted use",
        list: [
          "Browsing the site and reading its content for your own or legitimate business purposes.",
          "Contacting us about a real project.",
          "Sending an honest opinion about a real experience with us.",
        ],
      },
      {
        id: "prohibited",
        title: "Prohibited use",
        list: [
          "Sending false or impersonated details, spam or automated messages.",
          "Trying to hack, disrupt or bypass the protection of the site, or accessing the admin area without permission.",
          "Copying the site or parts of its design or code and presenting them as yours.",
          "Posting abusive or misleading reviews, or reviews that infringe others’ rights.",
          "Any use that breaks the law.",
        ],
      },
      {
        id: "ip",
        title: "Intellectual property",
        paragraphs: [
          "The site’s design, code, text, logo and visual identity belong to Qawsan Studio and are protected by intellectual property rights. They may not be copied or reused without written permission. Articles and published content are there to be read, and you may quote them with credit and a link to the source.",
        ],
      },
      {
        id: "work",
        title: "Work shown on the site",
        paragraphs: [
          "The work and images shown are projects we built. Some of them, with their brands and data, may belong to our clients, and they are shown only to illustrate our experience. We may edit images or hide sensitive data in them. If you own a project shown here and want it changed or removed, write to us.",
        ],
      },
      {
        id: "info",
        title: "Nature of the information and prices",
        paragraphs: [
          "Information on the site is general. Any budget or timeline ranges in the form are indicative and are not a binding quote. The actual price and timeline are set after we study your project and in a written agreement.",
        ],
      },
      {
        id: "reviews",
        title: "Reviews",
        paragraphs: [
          "By sending a review you allow us to publish it on the site with your name, role and text, and you confirm that it is your honest opinion. It appears as soon as it is sent, and we may hide or delete it if it breaks these terms.",
        ],
      },
      {
        id: "disclaimer",
        title: "Disclaimer",
        paragraphs: [
          "The site is provided “as is”, with no promise that it will run without interruption or errors. We work to keep the information accurate but do not guarantee it is complete. To the extent the law allows, we are not liable for indirect losses from using the site or relying on its content. This does not affect any right that cannot lawfully be waived.",
        ],
      },
      {
        id: "links",
        title: "Links and external services",
        paragraphs: [
          "The site may link to other sites and services, such as Instagram and LinkedIn. They are outside our control and we are not responsible for their content or policies.",
        ],
      },
      {
        id: "changes",
        title: "Changes",
        paragraphs: [
          "We may change the site, stop part of it or edit these terms at any time. The updated version is published here with its date, and continuing to use the site afterwards means you accept it.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        paragraphs: ["For any question about these terms, write to {email}."],
      },
    ],
  },

  cookies: {
    metaTitle: "Cookie Policy | Qawsan Studio",
    metaDescription: "What Qawsan stores in your browser, which measurement and marketing tools run only with your consent, and how to change your choice.",
    title: "Cookie Policy",
    intro: "This page explains what is stored in your browser when you visit the site, what runs only with your consent, and how to change your choice at any time.",
    sections: [
      {
        id: "what",
        title: "What are cookies?",
        paragraphs: [
          "Cookies are small files that websites save in your browser. We also use similar technologies here, such as Local Storage and Session Storage.",
        ],
      },
      {
        id: "why",
        title: "Why we use them",
        paragraphs: [
          "To run the site and remember your preferences, to understand how visitors use it and improve it, and to measure how our ads perform. They fall into three categories: necessary, analytics and marketing.",
        ],
      },
      {
        id: "necessary",
        title: "Necessary",
        paragraphs: ["Always on, need no consent and are not used for tracking. This is what the site itself stores in your browser:"],
        list: [
          "qawsan-mode: your light or dark theme preference.",
          "qawsan-consent: your cookie choice, so we remember it and do not show the dialog every time.",
          "qawsan-lead-…: a temporary mark in session storage that stops the same request being counted twice.",
        ],
        after: ["The site language comes from the page address (/en and /tr) and is not stored in a cookie."],
      },
      {
        id: "analytics",
        title: "Analytics (optional)",
        paragraphs: ["These run only if you agree, and help us see which pages are visited most and how people browse the site:"],
        list: [
          "Google Analytics 4 (Google): measures visits, pages and events such as sending a project request or clicking a contact method. We switched off its personalised-advertising features, and we send it no name, email or anything you type into forms.",
          "Microsoft Clarity (Microsoft): records browsing as session recordings and heatmaps so we can see where visitors get stuck. Form fields are masked in the recordings.",
        ],
        after: ["These tools may set cookies whose names and lifetimes they decide, which you can find in their policies listed below."],
      },
      {
        id: "marketing",
        title: "Marketing (optional)",
        paragraphs: [
          "Meta Pixel (Meta): tells Meta about your visit and about a project request you send, so we can measure how our Facebook and Instagram ads perform. It runs only if you agree to the marketing category, and we send it no form data.",
        ],
      },
      {
        id: "thirdparty",
        title: "Third-party tools",
        paragraphs: ["Each tool has its own privacy policy:"],
        list: [
          "Google: https://policies.google.com/privacy",
          "Microsoft: https://privacy.microsoft.com/privacystatement",
          "Meta: https://www.facebook.com/privacy/policy",
        ],
        after: [
          "Note: the site’s fonts load from Google Fonts, so Google receives your IP address when the page loads, whatever you choose about cookies. See the Privacy Policy for details.",
        ],
      },
      {
        id: "duration",
        title: "How long they last",
        paragraphs: [
          "Each tool sets the lifetime of its own files through its settings. Your choice is kept in your browser until you change it or clear browser data. We do not list cookie names and lifetimes we have not verified; a detailed table will be added only after checking it on the live site with the tools running.",
        ],
      },
      {
        id: "consent",
        title: "How consent works",
        list: [
          "On your first visit a dialog offers: accept all, reject non-essential, and customise.",
          "Analytics and marketing tools do not run before you agree, and closing the dialog does not count as agreeing.",
          "The optional categories are not ticked in advance.",
          "Rejecting does not stop you from browsing or using the site.",
        ],
      },
      {
        id: "change",
        title: "Changing or withdrawing your choice",
        paragraphs: [
          "Press “Cookie settings” at the bottom of any page, or the button below, to change your choice. When you withdraw consent, the tool stops sending and its cookies are removed as far as possible. You can also clear them in your browser settings.",
        ],
      },
    ],
  },
};

export default en;
