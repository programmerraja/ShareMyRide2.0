async function forgetPassword() {
  document.querySelector(".loading_wrapper").classList.toggle("invisible");
  let popup_container = document.querySelector(".popup_container");
  let forget_error = document.querySelector(".forget_error");
  let forget_email = document.querySelector(".forget_email").value;
  if (forget_email) {
    let body = JSON.stringify({
      "email": forget_email
    });
    let res = await fetch("#", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });

    res = await res.json();
    popup_container.style.display = "flex";
    popup_container.children[0].children[0].innerText = res.msg;
  }
}

function main() {
  let send_link = document.querySelector(".send_link");
  send_link.addEventListener("click", forgetPassword);

}
main();