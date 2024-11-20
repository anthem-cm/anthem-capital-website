document.addEventListener("DOMContentLoaded", () => {

  if (!getCookie("disclosureAccepted") || hasOneHourPassed()) {
      showDisclosure();
  } else {
      showHero();
  }

  // Disclosure accept
  const acceptButton = document.getElementById("accept");
  const disclosureText = document.getElementById("disclosureTextP");

  disclosureText.addEventListener("scroll", () => {

      if (disclosureText.scrollTop + disclosureText.clientHeight >= disclosureText.scrollHeight - 10) {
          acceptButton.disabled = false;
          acceptButton.classList.add("enabled");
      }
  });

  acceptButton.addEventListener("click", () => {
      acceptDisclosure();
  });
});

// Disclosure block show
function showDisclosure() {
  const disclosure = document.getElementById("disclosure");
  disclosure.style.display = "flex"; 
  document.body.classList.add("modal-active"); 
}

// Disclosure hide
function acceptDisclosure() {
  const disclosure = document.getElementById("disclosure");
  const logoLink = document.getElementById("logoLink");
  const menu = document.getElementById("burgerMenu");
  const navHome = document.getElementById("navHome");
  const navStrategy = document.getElementById("navStrategy");
  const navContact = document.getElementById("navContact");
  disclosure.classList.add("hidden"); 

  setTimeout(() => {
      menu.classList.remove("disabled");
      logoLink.classList.remove("disabled");
      
      navHome.classList.remove("disabled");
      navStrategy.classList.remove("disabled");
      navContact.classList.remove("disabled");


      disclosure.style.display = "none"; 
      document.body.classList.remove("modal-active"); 
      setCookie("disclosureAccepted", "true", 1); 
      setCookie("lastVisit", new Date().getTime(), 1); 
      showHero(); 
  }, 500); 
}

// Hero block
function showHero() {
  const disclosure = document.getElementById("disclosure");
  const logoLink = document.getElementById("logoLink");
  const menu = document.getElementById("burgerMenu");
  const navHome = document.getElementById("navHome");
  const navStrategy = document.getElementById("navStrategy");
  const navContact = document.getElementById("navContact");
  const hero = document.querySelector(".hero");
  disclosure.style.display = "none"; 
  
  navHome.classList.remove("disabled");
  navStrategy.classList.remove("disabled");
  navContact.classList.remove("disabled");
  document.body.classList.remove("modal-active"); 
  hero.classList.add("visible"); 
}

// Cookie check
function hasOneHourPassed() {
  const lastVisit = getCookie("lastVisit");
  console.log(lastVisit);
  if (lastVisit) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - lastVisit;
      console.log("Time difference in milliseconds: ", timeDifference);
      return timeDifference > 3600000; 
  }

  if (timeDifference > 3600000 == true) {
    
    console.log("True")
    return true
  }
  
}

// Set cookie
function setCookie(name, value, hours) {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  console.log("Coockie creations: " + name + "=" + value + ";" + expires + ";path=/")
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
  console.log(document.cookie)
}

// Coockie return
function getCookie(name) {
  const nameCockie = name + "=";
  const ca = document.cookie.split(';');
  console.log(ca)
  for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(nameCockie) == 0) return c.substring(nameCockie.length, c.length);
  }
  return null;
}


// Mobile menu
document.addEventListener("DOMContentLoaded", () => {
  const burgerMenu = document.getElementById("burgerMenu");
  const navMenu = document.getElementById("navMenu");

  burgerMenu.addEventListener("click", () => {
      document.body.classList.toggle("modal-active")
      navMenu.classList.toggle("open");

  });

  document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !burgerMenu.contains(e.target)) {
          navMenu.classList.remove("open");
          document.body.classList.remove("modal-active");
      }
  });
});


const form = document.getElementById("emailForm");
const responseMessage = document.getElementById("responseMessage");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch("https://formspree.io/f/mkgnzqbj", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      responseMessage.textContent = "Thank you for subscribing!";
      responseMessage.classList.remove("error");
      responseMessage.classList.add("success");
      form.reset();
    } else {
      throw new Error("Failed to subscribe.");
    }
  } catch (error) {
    responseMessage.textContent = "An error occurred. Please try again.";
    responseMessage.classList.remove("success");
    responseMessage.classList.add("error");
  }
});