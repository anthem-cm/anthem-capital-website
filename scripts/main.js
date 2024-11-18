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
    

      if (disclosureText.scrollTop + disclosureText.clientHeight >= disclosureText.scrollHeight) {
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
  const logoLink = document.getElementById("logoLink")
  const menu = document.getElementById("burgerMenu")
  disclosure.classList.add("hidden"); 

  setTimeout(() => {
      menu.classList.remove("disabled")
      logoLink.classList.remove("disabled")

      disclosure.style.display = "none"; 
      document.body.classList.remove("modal-active"); 
      setCookie("disclosureAccepted", "true", 1); 
      setCookie("lastVisit", new Date().getTime(), 1); 
      showHero(); 
  }, 500); 
}

// Hero block
function showHero() {
  const hero = document.querySelector(".hero");
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






