try {
  if (localStorage.getItem("tema") === "gelap") {
    document.documentElement.classList.add("dark");
  }
} catch {}
