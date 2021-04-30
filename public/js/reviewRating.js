
async function postReview() {

      document.querySelector(".loading_wrapper").classList.toggle("invisible");
      let ratings=document.querySelector(".ratings").value;
      let rider_id=document.querySelector(".ratings_button").attributes.id.value;
      let review=document.querySelector(".review").value;
      if(review && ratings && rider_id){
                let popup_container = document.querySelector(".popup_container");
                  let body = JSON.stringify({
                    "rider_id": rider_id,
                    "ratings":ratings,
                    "review":review
                  });
                  let res = await fetch("/user/post/review/", {
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
  let post_review=document.querySelector(".post_review");
  post_review.addEventListener("click",postReview);

}
main()