
// =============================================
// STYLEAI - FRONTEND JAVASCRIPT
// =============================================

// FastAPI backend address
const API_URL = "http://127.0.0.1:8000";


// =============================================
// GET HTML ELEMENTS
// =============================================

// Navigation
const heroAiButton = document.getElementById("heroAiButton");
const exploreButton = document.getElementById("exploreButton");
const stylistButton = document.getElementById("stylistButton");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const authButton = document.getElementById("authButton");
const authDialog = document.getElementById("authDialog");
const signInForm = document.getElementById("signInForm");
const authNameField = document.getElementById("authNameField");
const authName = document.getElementById("authName");
const authNicknameField = document.getElementById("authNicknameField");
const authNickname = document.getElementById("authNickname");
const authIdentifier = document.getElementById("authIdentifier");
const authIdentifierLabel =
    document.getElementById("authIdentifierLabel");
const authPassword = document.getElementById("authPassword");
const authTitle = document.getElementById("authTitle");
const authSubmit = signInForm.querySelector('button[type="submit"]');
const authModeToggle = document.getElementById("authModeToggle");
const authFeedback = document.getElementById("authFeedback");
const deleteAccountButton = document.getElementById("deleteAccountButton");
const closeAuthDialog = document.getElementById("closeAuthDialog");
const themeToggle = document.getElementById("themeToggle");

// Model image
const modelImage = document.getElementById("modelImage");
const modelPreview = document.getElementById("modelPreview");
const modelPreviewContainer =
    document.getElementById("modelPreviewContainer");
const removeModelImage = document.getElementById("removeModelImage");

// Clothing image
const clothingImage = document.getElementById("clothingImage");
const clothingPreview = document.getElementById("clothingPreview");
const clothingPreviewContainer =
    document.getElementById("clothingPreviewContainer");
const removeClothingImage =
    document.getElementById("removeClothingImage");

// Generator
const generateButton =
    document.getElementById("generateOutfitButton");
const generateButtonText =
    document.getElementById("generateButtonText");
const generationStatus =
    document.getElementById("generationStatus");

// Generated result
const generatedResult =
    document.getElementById("generatedResult");
const generatedImage =
    document.getElementById("generatedImage");
const downloadOutfit =
    document.getElementById("downloadOutfit");

// AI Stylist chat
const styleInput = document.getElementById("styleInput");
const sendStyleButton =
    document.getElementById("sendStyleButton");
const chatMessages =
    document.getElementById("chatMessages");


// =============================================
// NAVIGATION FUNCTIONS
// =============================================

// Demo-only sign-in state; credentials are never stored or sent.
let isSignUpMode = false;
const DEMO_ACCOUNTS_KEY = "styleai-demo-accounts";

function getDemoAccounts() {
    const accounts = JSON.parse(
        localStorage.getItem(DEMO_ACCOUNTS_KEY) || "[]"
    );

    if (!Array.isArray(accounts)) {
        throw new Error("Saved demo accounts are invalid.");
    }

    if (
        !accounts.every(function (account) {
            return account &&
                typeof account.name === "string" &&
                typeof account.nickname === "string" &&
                typeof account.email === "string";
        })
    ) {
        throw new Error("Saved demo account details are invalid.");
    }

    return accounts;
}

function setAuthFeedback(message) {
    authFeedback.textContent = message;
}

function updateAuthButton() {
    const signedInEmail = sessionStorage.getItem("styleai-demo-email");
    const isSignedIn = Boolean(signedInEmail);

    authButton.textContent = isSignedIn ? "Sign out" : "Sign in";
    authButton.setAttribute(
        "aria-label",
        isSignedIn ? `Sign out (${signedInEmail})` : "Sign in"
    );
    deleteAccountButton.hidden = !isSignedIn;
}

function setAuthMode(isSignUp) {
    isSignUpMode = isSignUp;
    authTitle.textContent = isSignUp ? "Create account" : "Sign in";
    authSubmit.textContent = isSignUp ? "Sign up" : "Sign in";
    authModeToggle.textContent = isSignUp
        ? "Already have an account? Sign in"
        : "Don't have an account? Sign up";
    authNameField.hidden = !isSignUp;
    authNicknameField.hidden = !isSignUp;
    authName.required = isSignUp;
    authNickname.required = isSignUp;
    authIdentifier.type = isSignUp ? "email" : "text";
    authIdentifierLabel.textContent = isSignUp
        ? "Email address"
        : "Nickname or email";
    authIdentifier.placeholder = isSignUp
        ? "you@example.com"
        : "Enter your nickname or email";
    authIdentifier.autocomplete = isSignUp ? "email" : "username";
    authPassword.autocomplete = isSignUp ? "new-password" : "current-password";
    authPassword.minLength = isSignUp ? 8 : 0;
    authPassword.placeholder = isSignUp
        ? "At least 8 characters (demo only)"
        : "Password (demo only)";
    setAuthFeedback("");
}

setAuthMode(false);
updateAuthButton();

authButton.addEventListener("click", function () {
    if (sessionStorage.getItem("styleai-demo-email")) {
        sessionStorage.removeItem("styleai-demo-email");
        updateAuthButton();
        return;
    }

    setAuthMode(false);
    authDialog.showModal();
    authIdentifier.focus();
});

authModeToggle.addEventListener("click", function () {
    setAuthMode(!isSignUpMode);
});

signInForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!signInForm.reportValidity()) {
        return;
    }

    try {
        const accounts = getDemoAccounts();

        if (isSignUpMode) {
            const name = authName.value.trim();
            const nickname = authNickname.value.trim();
            const email = authIdentifier.value.trim().toLowerCase();
            const nicknameKey = nickname.toLowerCase();

            if (
                accounts.some(function (account) {
                    return account.email.toLowerCase() === email ||
                        account.nickname.toLowerCase() === nicknameKey;
                })
            ) {
                setAuthFeedback(
                    "That email or nickname is already registered in this browser."
                );
                return;
            }

            accounts.push({ name, nickname, email });
            localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
            sessionStorage.setItem("styleai-demo-email", email);
        } else {
            const identifier = authIdentifier.value.trim().toLowerCase();
            const account = accounts.find(function (savedAccount) {
                return savedAccount.email.toLowerCase() === identifier ||
                    savedAccount.nickname.toLowerCase() === identifier;
            });

            if (!account) {
                setAuthFeedback(
                    "No demo account matches that nickname or email. Sign up first."
                );
                return;
            }

            sessionStorage.setItem("styleai-demo-email", account.email);
        }

        signInForm.reset();
        setAuthMode(false);
        authDialog.close();
        updateAuthButton();
    } catch (error) {
        setAuthFeedback(
            error instanceof Error
                ? `Could not update the demo account: ${error.message}`
                : "Could not update the demo account."
        );
    }
});

deleteAccountButton.addEventListener("click", function () {
    const signedInEmail = sessionStorage.getItem("styleai-demo-email");

    if (!signedInEmail) {
        updateAuthButton();
        return;
    }

    const confirmed = window.confirm(
        `Delete the demo account for ${signedInEmail}? This removes its saved profile from this browser.`
    );

    if (confirmed) {
        try {
            const accounts = getDemoAccounts().filter(function (account) {
                return account.email !== signedInEmail;
            });

            localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
            sessionStorage.removeItem("styleai-demo-email");
            updateAuthButton();
        } catch (error) {
            window.alert(
                error instanceof Error
                    ? `Could not delete the demo account: ${error.message}`
                    : "Could not delete the demo account."
            );
        }
    }
});

closeAuthDialog.addEventListener("click", function () {
    authDialog.close();
});

authDialog.addEventListener("click", function (event) {
    if (event.target === authDialog) {
        authDialog.close();
    }
});

// Keep the theme preference between visits.
function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
}

applyTheme(localStorage.getItem("styleai-theme") || "light");

themeToggle.addEventListener("click", function () {
    const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";

    localStorage.setItem("styleai-theme", nextTheme);
    applyTheme(nextTheme);
});

// Scroll to AI outfit generator
if (heroAiButton) {
    heroAiButton.addEventListener("click", function () {
        document.getElementById("outfit-generator")
            .scrollIntoView({ behavior: "smooth" });
    });
}


// Scroll to Discover section
if (exploreButton) {
    exploreButton.addEventListener("click", function () {
        document.getElementById("discover")
            .scrollIntoView({ behavior: "smooth" });
    });
}


// Scroll to AI Stylist
if (stylistButton) {
    stylistButton.addEventListener("click", function () {
        styleInput.focus();
        document.getElementById("stylist")
            .scrollIntoView({ behavior: "smooth" });
    });
}


// Mobile navigation
if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        const isOpen = navLinks.classList.toggle("show");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("show");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        });
    });
}


// =============================================
// IMAGE PREVIEW FUNCTIONS
// =============================================

// Store temporary preview URLs
let modelPreviewURL = null;
let clothingPreviewURL = null;


// Allowed image formats
const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
];


// Maximum image size: 10 MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;


// Validate selected image
function validateImage(file) {

    if (!file) {
        return "Please select an image.";
    }

    if (!allowedImageTypes.includes(file.type)) {
        return "Please select a JPG, PNG, WEBP or AVIF image.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return "Image size must not exceed 10 MB.";
    }

    return null;
}


// Show selected image preview
function showImagePreview(file, preview, container, oldURL) {

    if (oldURL) {
        URL.revokeObjectURL(oldURL);
    }

    const newURL = URL.createObjectURL(file);

    preview.src = newURL;
    container.hidden = false;

    return newURL;
}


// Model image selection
modelImage.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const error = validateImage(file);

    if (error) {
        alert(error);
        this.value = "";
        return;
    }

    modelPreviewURL = showImagePreview(
        file,
        modelPreview,
        modelPreviewContainer,
        modelPreviewURL
    );

});


// Clothing image selection
clothingImage.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    const error = validateImage(file);

    if (error) {
        alert(error);
        this.value = "";
        return;
    }

    clothingPreviewURL = showImagePreview(
        file,
        clothingPreview,
        clothingPreviewContainer,
        clothingPreviewURL
    );

});


// Remove model photo
removeModelImage.addEventListener("click", function () {

    modelImage.value = "";

    modelPreviewContainer.hidden = true;
    modelPreview.removeAttribute("src");

    if (modelPreviewURL) {
        URL.revokeObjectURL(modelPreviewURL);
        modelPreviewURL = null;
    }

});


// Remove clothing photo
removeClothingImage.addEventListener("click", function () {

    clothingImage.value = "";

    clothingPreviewContainer.hidden = true;
    clothingPreview.removeAttribute("src");

    if (clothingPreviewURL) {
        URL.revokeObjectURL(clothingPreviewURL);
        clothingPreviewURL = null;
    }

});


// =============================================
// WAIT FUNCTION
// =============================================

// Wait before checking Claid task status again
function wait(milliseconds) {

    return new Promise(function (resolve) {
        setTimeout(resolve, milliseconds);
    });

}


// =============================================
// UPDATE GENERATION STATUS
// =============================================

function updateStatus(message) {
    generationStatus.textContent = message;
}


// =============================================
// UPLOAD IMAGES TO FASTAPI
// =============================================

async function uploadImages(modelFile, clothingFile) {

    // FormData sends files to FastAPI
    const formData = new FormData();

    formData.append("model_image", modelFile);
    formData.append("clothing_image", clothingFile);

    const response = await fetch(
        `${API_URL}/upload-images`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Could not upload images."
        );
    }

    return data;

}


// =============================================
// REQUEST OUTFIT GENERATION FROM CLAID
// =============================================

async function requestOutfitGeneration(
    modelImageURL,
    clothingImageURL
) {

    const response = await fetch(
        `${API_URL}/generate-outfit`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model_image_url: modelImageURL,
                clothing_image_url: clothingImageURL
            })
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Could not start outfit generation."
        );
    }

    if (!data.task_id) {
        throw new Error("Claid did not return a task ID.");
    }

    return data;

}


// =============================================
// CHECK CLAID GENERATION STATUS
// =============================================

async function checkGenerationStatus(taskId) {

    const response = await fetch(
        `${API_URL}/generate-outfit/${taskId}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Could not check generation status."
        );
    }

    return data;

}


// =============================================
// DISPLAY GENERATED IMAGE
// =============================================

function displayGeneratedOutfit(imageURL) {

    return new Promise(function (resolve, reject) {

        generatedImage.onload = function () {

            generatedResult.hidden = false;

            downloadOutfit.href = imageURL;

            generatedResult.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            resolve();

        };

        generatedImage.onerror = function () {

            reject(
                new Error("The generated image could not be displayed.")
            );

        };

        generatedImage.src = imageURL;

    });

}


// =============================================
// MAIN OUTFIT GENERATION PROCESS
// =============================================

generateButton.addEventListener("click", async function () {

    const modelFile = modelImage.files[0];
    const clothingFile = clothingImage.files[0];


    // STEP 1: CHECK BOTH IMAGES

    if (!modelFile || !clothingFile) {

        updateStatus(
            "Please upload both a model photo and a clothing photo."
        );

        return;

    }


    // STEP 2: VALIDATE IMAGES

    const modelError = validateImage(modelFile);
    const clothingError = validateImage(clothingFile);

    if (modelError || clothingError) {

        updateStatus(modelError || clothingError);

        return;

    }


    // STEP 3: PREPARE GENERATION

    generateButton.disabled = true;

    generateButtonText.textContent = "Please wait...";

    generatedResult.hidden = true;

    updateStatus("Preparing your fashion transformation...");


    try {

        // STEP 4: UPLOAD BOTH IMAGES

        updateStatus("Uploading your photos...");

        const uploadData = await uploadImages(
            modelFile,
            clothingFile
        );


        // STEP 5: START CLAID GENERATION

        updateStatus("Your photos are uploaded. Creating your outfit...");

        const generationData = await requestOutfitGeneration(
            uploadData.model_image.url,
            uploadData.clothing_image.url
        );

        const taskId = generationData.task_id;


        // STEP 6: CHECK TASK STATUS

        updateStatus("Your AI outfit is being generated...");

        let outfitReady = false;

        const maxAttempts = 40;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {

            // Wait three seconds before checking status
            await wait(3000);

            const statusData = await checkGenerationStatus(taskId);


            // Generation completed
            if (statusData.status === "DONE") {

                if (!statusData.image_url) {
                    throw new Error(
                        "Generation completed, but no image URL was returned."
                    );
                }

                updateStatus("Your outfit is ready! Loading image...");

                await displayGeneratedOutfit(
                    statusData.image_url
                );

                updateStatus(
                    "Success! Your AI-generated outfit is ready."
                );

                outfitReady = true;

                break;

            }


            // Generation failed
            if (statusData.status === "ERROR") {

                throw new Error(
                    statusData.message ||
                    "Claid could not generate your outfit."
                );

            }


            // Still processing
            updateStatus(
                `Creating your outfit... Please wait (${attempt}/${maxAttempts})`
            );

        }


        // STEP 7: CHECK IF TIME LIMIT WAS REACHED

        if (!outfitReady) {

            throw new Error(
                "Generation is taking longer than expected. Please try again."
            );

        }


    } catch (error) {

        console.error("StyleAI generation error:", error);

        updateStatus(
            "Sorry, something went wrong: " + error.message
        );

    } finally {

        // STEP 8: ENABLE BUTTON AGAIN

        generateButton.disabled = false;

        generateButtonText.textContent = "Generate My Outfit";

    }

});


// =============================================
// AI STYLIST CHAT DEMONSTRATION
// =============================================

// Add a chat message to the screen
function addChatMessage(message, messageType) {

    const messageElement = document.createElement("div");

    messageElement.classList.add(
        "chat-message",
        messageType
    );

    // textContent prevents user input from being treated as HTML
    messageElement.textContent = message;

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;

}


// Send chat message
function sendStyleRequest() {

    const message = styleInput.value.trim();

    if (message === "") {
        return;
    }

    // Display user's message
    addChatMessage(message, "user-message");

    styleInput.value = "";


    // This is a demonstration response.
    // It is not connected to an AI text-generation API.
    setTimeout(function () {

        addChatMessage(
            "✨ Thanks for sharing your style idea! For a personalized outfit image, use the AI Outfit Generator above. Upload your model and clothing photos to create your look.",
            "ai-message"
        );

    }, 700);

}


// Send button
sendStyleButton.addEventListener(
    "click",
    sendStyleRequest
);


// Send message using Enter key
styleInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        sendStyleRequest();
    }

});
