async function resetPassword() {
  document.querySelector(".loading_wrapper").classList.toggle("invisible");
  let popup_container = document.querySelector(".popup_container");
  let reset_error = document.querySelector(".reset_error");
  let reset_password = document.querySelector(".reset_password").value;
  if (reset_password) {
    let body = JSON.stringify({
      "password": reset_password
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
  let change_password = document.querySelector(".change_password");
  change_password.addEventListener("click", resetPassword);

}
main();