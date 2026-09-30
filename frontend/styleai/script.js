// Hero AI button
const heroAiButton = document.getElementById("heroAiButton");

// Explore button
const exploreButton = document.getElementById("exploreButtion");

// AI Stylist button
const stylistButton = document.getElementById("stylistButton");

// Chat input
const styleInput = document.getElementById("styleInput");

// Chat send button
const sendStyleButton = document.getElementById("sendStyleButton");

// AI chat box
const aiBox = document.querySelector(".ai-box");


// HERO AI BUTTON
heroAiButton.addEventListener("click", function () {

    // Scroll to the AI Stylist section
    document.getElementById("stylist").scrollIntoView({
        behavior: "smooth"
    });
});

// EXPLORE LOOKS BUTTON
exploreButton.addEventListener("click", function () {

    // Scroll to Discover
    document.getElementById("discover").scrollIntoView({
        behavior:"smooth"
    });
});

// TRY AI STYLIST BUTTON
stylistButton.addEventListener("click", function () {

    // Put the cursor inside the chat box
    styleInput.focus();

});

// SEND STYLE REQUEST
function sendStyleRequest() {

    // Get what the user typed
    const message = styleInput.value.trim();

    // Don't send empty messages
    if (message === "") {
        return;
    }

    // CREATE USER MESSAGE
    const userMessage = document.createElement("div");

    userMessage.classList.add(
        "chat-message",
        "user-message"
    );

    // Clear input
    styleInput.value = "";

    // TEMPORARY AI RESPONSE
    const aiMessage = document.createElement("div");

    aiMessage.classList.add(
        "chat-message",
        "ai-message"
    );

    aiMessage.textContent = 
        "✨ I'm preparing a personalized style recommendation for you.";

    // Add AI response
    aiBox.insertBefore(
        aiMessage,
        document.querySelector(".chat-input")
    );

    // Scroll chat to bottom
    aiBox.scrollTop = aiBox.scrollHeight;

}

// SEND BUTTON CLICK
sendStyleButton.addEventListener(
    "click",
    sendStyleRequest
);

// ENTER KEY
styleInput.addEventListener(
    "keydown",
    function (event) {
        
        // Send message when Enter is pressed
        if (event.key === "Enter") {

            sendStyleRequest();
        }
    }
);