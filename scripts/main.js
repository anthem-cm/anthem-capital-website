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

});

// Disclosure block show
function showDisclosure() {
  const disclosure = document.getElementById("disclosure");
  const navHide = document.getElementById("navMenuContainer")
  disclosure.style.display = "flex"; 
  document.body.classList.add("modal-active"); 
  navHide.classList.add("nav-hidden");
  console.log(navHide);

}

// Disclosure hide

document.getElementById("accept").addEventListener("click", function() {

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

)
// Hero block
function showHero() {
  const disclosure = document.getElementById("disclosure");
  const logoLink = document.getElementById("logoLink");
  const menu = document.getElementById("burgerMenu");
  const navHome = document.getElementById("navHome");
  const navStrategy = document.getElementById("navStrategy");
  const navContact = document.getElementById("navContact");
  const hero = document.querySelector(".hero");
  const navHide = document.getElementById("navMenuContainer")
  disclosure.style.display = "none"; 
  
  navHome.classList.remove("disabled");
  navHide.classList.remove("nav-hidden");
  navStrategy.classList.remove("disabled");
  navContact.classList.remove("disabled");
  document.body.classList.remove("modal-active"); 
  logoLink.classList.remove("disabled");
  menu.classList.remove("disabled");
  hero.classList.add("visible"); 
}

// Cookie check
function hasOneHourPassed() {
  const lastVisit = getCookie("lastVisit");
  if (lastVisit) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - lastVisit;
      return timeDifference > 3600000; 
  }

  if (timeDifference > 3600000 == true) {
    
    return true
  }
  
}

// Set cookie
function setCookie(name, value, hours) {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Coockie return
function getCookie(name) {
  const nameCockie = name + "=";
  const ca = document.cookie.split(';');
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
  const logoLink = document.getElementById("logoLink");
  const zIndex = window.getComputedStyle(logoLink).zIndex;

  burgerMenu.addEventListener("click", () => {
      document.body.classList.toggle("modal-active");
      navMenu.classList.toggle("open");
      if (zIndex === "10") {
        logoLink.style.zIndex = "0";
      } else{
        logoLink.style.zIndex = "10";
      }
  });

  document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !burgerMenu.contains(e.target)) {
          navMenu.classList.remove("open");
          document.body.classList.remove("modal-active");
          if (zIndex === "10") {
            logoLink.style.zIndex = "0";
          } else{
            logoLink.style.zIndex = "10";
          }
      }
  });
});


const form = document.getElementById("emailForm");
const responseMessage = document.getElementById("responseMessage");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  try {
    const response = await fetch("https://formspree.io/f/xkgnawra", {
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