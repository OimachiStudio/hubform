// Parse the 'key' parameter along with existing parameters
const getQueryParam = (param) => {
  const scripts = document.getElementsByTagName("script");
  const src = scripts[scripts.length - 1].src;
  return new URLSearchParams(src.split("?")[1]).get(param);
};

const hubspot_portalId = getQueryParam("hubspot_portalId");
const hubspot_region = getQueryParam("hubspot_region") || "eu1";
const license_key = getQueryParam("key");
let isGatedPage;

// Check if the script should run based on domain and license key
const shouldRunScript = () => {
  if (license_key === "a1va2TjlfObm") {
    return true; // Licensed version, run on any domain
  } else {
    return window.location.hostname.endsWith(".webflow.io"); // Free version, only on Webflow domains
  }
};

if (shouldRunScript()) {
  // Declare global variables
  window.hubformConfig = {
    animationType: "fade",
    gatedId: null,
    cookieExpirationDays: 30,
  };

  (function (window) {
    // Add a variable to store the current form ID
    let currentFormId = null;

    //==============================================================
    // 1. UTILITY FUNCTIONS
    //==============================================================

    // Extracts a query parameter from the script tag's src attribute
    const getQueryParam = (param) => {
      const scripts = document.getElementsByTagName("script");
      const src = scripts[scripts.length - 1].src;
      return new URLSearchParams(src.split("?")[1]).get(param);
    };

    // Retrieves a parameter from the current page's URL
    const getUrlParameter = (name) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name) || "";
    };

    // Check if gating should be active
    function isGatingActive() {
      return typeof isGatedPage === "undefined" || isGatedPage === true;
    }

    // Function to initialize the display of gated elements
    function initializeGatedElementsDisplay() {
      document.querySelectorAll('[hf-gated="hide"]').forEach((el) => {
        const customDisplay = el.getAttribute("hf-gated-display");
        if (customDisplay) {
          el.style.display = customDisplay;
        } else {
          el.style.display = "block"; // Default to block if no custom display is set
        }
      });
    }

    //==============================================================
    // 2. HUBSPOT INTEGRATION
    //==============================================================

    // Get HubSpot configuration from script tag
    const hubspot_portalId = getQueryParam("hubspot_portalId");
    const hubspot_region = getQueryParam("hubspot_region") || "eu1";

    // Creates a HubSpot form with the given formId and submission callback
    const createHubSpotForm = (formId, onSubmitCallback) => {
      $("#hsFormContainer").empty();
      currentFormId = formId;
      hbspt?.forms?.create({
        region: hubspot_region,
        portalId: hubspot_portalId,
        formId: formId,
        target: "#hsFormContainer",
        onFormSubmit: onSubmitCallback,
        onFormSubmitted: () => {
          handleFormSubmission();
        },
      });
    };

    //==============================================================
    // 3. MODAL FUNCTIONALITY
    //==============================================================

    const modal = $(".modal_component");
    const modalWrapper = $(".modal_wrapper");
    const modalOverlay = $(".modal_overlay");

    const animations = {
      fade: {
        open: () => {
          modalWrapper.css({ opacity: "0" });
          modalOverlay.css({ opacity: "0" });
          setTimeout(() => {
            modalWrapper.css({ opacity: "1", transition: "opacity 0.2s" });
            modalOverlay.css({ opacity: "1", transition: "opacity 0.5s" });
          }, 10);
        },
        close: () => {
          modalWrapper.css({ opacity: "0", transition: "opacity 0.2s" });
          modalOverlay.css({ opacity: "0", transition: "opacity 0.5s" });
          return 500; // Animation duration
        },
      },
      moveUp: {
        open: () => {
          modalWrapper.css({ transform: "translateY(8rem)", opacity: "0" });
          modalOverlay.css({ opacity: "0" });
          setTimeout(() => {
            modalWrapper.css({
              transform: "translateY(0)",
              opacity: "1",
              transition:
                "transform 0.8s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.2s",
            });
            modalOverlay.css({ opacity: "1", transition: "opacity 0.5s" });
          }, 10);
        },
        close: () => {
          modalWrapper.css({
            transform: "translateY(0)",
            opacity: "1",
            transition:
              "transform 0.8s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.2s",
          });
          modalOverlay.css({ opacity: "1" });

          setTimeout(() => {
            modalWrapper.css({
              transform: "translateY(8rem)",
              opacity: "0",
            });
            modalOverlay.css({ opacity: "0", transition: "opacity 0.5s" });
          }, 10);

          return 800; // Animation duration
        },
      },
      scaleUp: {
        open: () => {
          modalWrapper.css({ transform: "scale(0.7)", opacity: "0" });
          modalOverlay.css({ opacity: "0" });
          setTimeout(() => {
            modalWrapper.css({
              transform: "scale(1)",
              opacity: "1",
              transition:
                "transform 0.5s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.3s",
            });
            modalOverlay.css({ opacity: "1", transition: "opacity 0.5s" });
          }, 10);
        },
        close: () => {
          modalWrapper.css({
            transform: "scale(0.7)",
            opacity: "0",
            transition:
              "transform 0.5s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.3s",
          });
          modalOverlay.css({ opacity: "0", transition: "opacity 0.5s" });
          return 500; // Animation duration
        },
      },
      bounceUp: {
        open: () => {
          modalWrapper.css({ transform: "translateY(12rem)", opacity: "0" });
          modalOverlay.css({ opacity: "0" });
          setTimeout(() => {
            modalWrapper.css({
              transform: "translateY(0)",
              opacity: "1",
              transition:
                "transform 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 0.3s",
            });
            modalOverlay.css({ opacity: "1", transition: "opacity 0.5s" });
          }, 10);
        },
        close: () => {
          modalWrapper.css({
            transform: "translateY(12rem)",
            opacity: "0",
            transition:
              "transform 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.3s",
          });
          modalOverlay.css({ opacity: "0", transition: "opacity 0.5s" });
          return 600; // Animation duration
        },
      },
    };

    const animateModal = (
      action,
      type = window.hubformConfig.animationType
    ) => {
      const animationSet = animations[type] || animations.fade;
      if (action === "open") {
        modal.css({ display: "flex", opacity: "1" });
        animationSet.open();
      } else if (action === "close") {
        return new Promise((resolve) => {
          const duration = animationSet.close();
          setTimeout(() => {
            modal.css({ display: "none", opacity: "", transition: "" });
            modalWrapper.css({ transform: "", opacity: "", transition: "" });
            modalOverlay.css({ opacity: "", transition: "" });
            resolve();
          }, duration);
        });
      }
    };

    const openModal = (
      formId,
      animationType = window.hubformConfig.animationType
    ) => {
      $("body").addClass("modal-open").css("overflow", "hidden");
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("modal", "open");
      if (formId) currentUrl.searchParams.set("formID", formId);
      history.pushState({}, "", currentUrl.toString());
      animateModal("open", animationType);
    };

    const closeModal = async (
      animationType = window.hubformConfig.animationType
    ) => {
      await animateModal("close", animationType);
      $("body").removeClass("modal-open").css("overflow", "");
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("modal");
      currentUrl.searchParams.delete("formID");
      history.pushState({}, "", currentUrl.toString());
    };

    //==============================================================
    // 4. FORM SUBMISSION HANDLING / COOKIES
    //==============================================================

    // Function to unlock gated content
    function unlockGatedContent() {
      const accessGranted = Cookies.get("gatedUnlocked") === "true";
      const gatingActive = isGatingActive();

      if (!gatingActive || accessGranted) {
        // Handle elements with hf-gated="hide"
        document.querySelectorAll('[hf-gated="hide"]').forEach((el) => {
          el.style.display = "none";
        });

        // Handle elements with hf-gated="wrapper"
        document.querySelectorAll('[hf-gated="wrapper"]').forEach((el) => {
          el.classList.remove("hf-gated");
        });
      } else {
        // If gating is active and access is not granted
        document.querySelectorAll('[hf-gated="hide"]').forEach((el) => {
          const customDisplay = el.getAttribute("hf-gated-display");
          if (customDisplay) {
            el.style.display = customDisplay;
          } else {
            el.style.display = "block"; // Default to block if no custom display is set
          }
        });

        document.querySelectorAll('[hf-gated="wrapper"]').forEach((el) => {
          el.classList.add("hf-gated");
        });
      }
    }

    // Handles actions after successful form submission
    const handleFormSubmission = () => {
      if (
        isGatingActive() &&
        window.hubformConfig.gatedId &&
        currentFormId === window.hubformConfig.gatedId
      ) {
        Cookies.set("gatedUnlocked", "true", {
          expires: window.hubformConfig.cookieExpirationDays,
        });
        unlockGatedContent();
      }
    };

    //==============================================================
    // 5. MAIN FUNCTIONALITY
    //==============================================================

    // Creates a HubSpot form and opens the modal
    const createFormAndOpenModal = (formId, animationType) => {
      createHubSpotForm(formId, handleFormSubmission);
      openModal(formId, animationType);
    };

    // Initializes the form and modal based on URL parameters
    const initializeFromUrl = () => {
      const modalOpen = getUrlParameter("modal");
      const formID = getUrlParameter("formID");

      if ((modalOpen === "open" || modalOpen.startsWith("open?")) && formID) {
        createFormAndOpenModal(formID);
      }
    };

    //==============================================================
    // 6. EVENT LISTENERS
    //==============================================================

    // Sets up all necessary event listeners
    const setupEventListeners = () => {
      // Handle modal trigger clicks
      $(document).on("click", '[hf-modal="true"]', function (e) {
        e.preventDefault();
        const formId = $(this).attr("hf-form-id");
        const animationType =
          $(this).attr("hf-animation") || window.hubformConfig.animationType;
        if (formId) createFormAndOpenModal(formId, animationType);
      });

      // Handle modal close actions
      $(document).on("click", ".modal_close-button, .modal_overlay", () =>
        closeModal()
      );

      // Handle Escape key press
      $(document).on("keydown", (event) => {
        if (event.key === "Escape" && $("body").hasClass("modal-open"))
          closeModal();
      });
    };

    //==============================================================
    // 7. INITIALIZATION
    //==============================================================

    // Run initialization when DOM is ready
    $(document).ready(() => {
      initializeFromUrl();
      setupEventListeners();
      initializeGatedElementsDisplay();
      unlockGatedContent();
    });

    // Expose necessary functions to the global scope
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.createFormAndOpenModal = createFormAndOpenModal;
  })(window);

  // Enhanced function to update hubform settings
  window.hubformSettings = function (settings) {
    window.hubformConfig = { ...window.hubformConfig, ...settings };

    // If cookieExpirationDays is updated and gatedUnlocked cookie exists, update its expiration
    if ("cookieExpirationDays" in settings && Cookies.get("gatedUnlocked")) {
      Cookies.set("gatedUnlocked", "true", {
        expires: window.hubformConfig.cookieExpirationDays,
      });
    }
  };
} else {
  console.warn("Hubform script is not licensed for this domain.");
}

// Allow setting isGatedPage dynamically on CMS pages
window.setGatedPage = function (value) {
  isGatedPage = value;
  unlockGatedContent(); // Re-evaluate gating when the value changes
};
