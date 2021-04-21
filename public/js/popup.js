function closePopup() {
  //for admin page and myrides and search result
  let loading_wrapper = document.querySelector(".loading_wrapper");
  //for booking page if it avalible once user clicked ok button we need to move back
  let booking_btn = document.querySelector(".booking_btn");
  if (loading_wrapper) {
    loading_wrapper.classList.toggle("invisible");
  }
  if (booking_btn) {
    window.history.back();
  }

  var popup_container = document.querySelector(".popup_container");
  popup_container.style.display = "none";
}

function main() {
  var popup_button = document.querySelector(".popup_button");
  popup_button.addEventListener("click", closePopup);
}
main();