function showDropDown(e) {
  if (!(e === false)) {
    let index = e.target.attributes.index.value;
    let dropdown = document.querySelector(".index" + index);
    let myrides_wrapper = document.querySelector(".myrides_wrapper");
    dropdown.classList.toggle("invisible");
    myrides_wrapper.classList.toggle("invisible");
    dropdown.classList.add("active_drop");
  } else {
    let dropdown = document.querySelector(".active_drop");
    let myrides_wrapper = document.querySelector(".myrides_wrapper");

    dropdown.classList.toggle("invisible");
    myrides_wrapper.classList.toggle("invisible");

    dropdown.classList.remove("active_drop");
  }

}

async function askReason(e) {
  //blocking user
  let form_wrapper =document.querySelector(".form_wrapper");
  form_wrapper.style.display="flex";
  let id = e.target.attributes.id.value;
  let form_button=document.querySelector(".form_button");
  form_button.addEventListener("click",(e)=>{removeRide(e)});


  async function removeRide(e){
     form_wrapper.style.display="none";
      document.querySelector(".loading_wrapper").classList.toggle("invisible");
      let reason=document.querySelector(".form_text").value;
      if(reason){
                let popup_container = document.querySelector(".popup_container");
                if (id) {
                  let body = JSON.stringify({
                    "id": id,
                    "reason":reason
                  });
                  let res = await fetch("/user/unbook/ride/", {
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
  }

}

function main() {
  let dot = document.querySelectorAll(".myrides-dot");

  let myrides_wrapper = document.querySelector(".myrides_wrapper");
  myrides_wrapper.addEventListener("click", () => {
    showDropDown(false)
  });

  for (let i = 0; i < dot.length; i++) {
    dot[i].addEventListener("click", (e) => {
      showDropDown(e)
    });
  }
  let remove_text = document.querySelectorAll(".myrides_dropdown-option1");
  if (remove_text) {
    for (let i = 0; i < dot.length; i++) {
      remove_text[i].addEventListener("click", (e) => {
        askReason(e)
      });
    }
  }

}
main()