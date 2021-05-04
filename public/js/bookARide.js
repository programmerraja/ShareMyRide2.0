async function bookARide(e) {
  //blocking user
  document.querySelector(".loading_wrapper").classList.toggle("invisible");
  let popup_container = document.querySelector(".popup_container");
  let passenger = document.querySelector(".booking_card-passenger");
  if (passenger) {
    passenger = passenger.value;
  }

  let message = document.querySelector(".booking_card-msg").value;
  let id = e.target.attributes.id.value;
  if (message && id) {
    let body = JSON.stringify({
      "id": id,
      "message": message,
      "passenger": passenger
    });
    let res = await fetch("/user/book/ride", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });

    res = await res.json();
    console.log(res);
    if (res.status === "success") {
      popup_container.style.display = "flex";
      popup_container.children[0].children[0].innerText = res.msg;
    } else {
      popup_container.style.display = "flex";
      popup_container.children[0].children[0].innerText = res.msg;
    }
  }
}

function main() {
  let booking_btn = document.querySelector(".booking_btn");
  console.log(booking_btn)
  booking_btn.addEventListener("click", (e) => {
    bookARide(e)
  });

}
main();