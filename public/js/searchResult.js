async function setAlert(e) {

  let loading_wrapper = document.querySelector(".loading_wrapper");
  loading_wrapper.classList.toggle("invisible");
  let popup_container = document.querySelector(".popup_container");
  let user_id = e.target.attributes.id.value;
  let from = document.querySelector("input[name='from']").value;
  let to = document.querySelector("input[name='to']").value;
  let date = document.querySelector("input[name='date']").value;
  let type = document.querySelector("select[name='type']").value;

  if (from && to && date) {
    let body = JSON.stringify({
      "user_id": user_id,
      "from": from,
      "to": to,
      "type": type,
      "date": date
    });
    let res = await fetch("/user/set/alert", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });

    res = await res.json();

    if (res.status === "Sucess") {
      popup_container.style.display = "flex";
      popup_container.children[0].children[0].innerText = res.msg;
    } else {
      popup_container.style.display = "flex";
      popup_container.children[0].children[0].innerText = res.msg;
    }
  }
}

function main() {
  alert_btn = document.querySelector(".alert_box-btn");
  alert_btn.addEventListener("click", (e) => {
    setAlert(e)
  });
}

main();