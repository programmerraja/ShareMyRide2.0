var popup_container = document.querySelector(".popup_container");

//reused for both rider and user
async function removeRider(event, link, is_verifiy = false) {
  document.querySelector(".loading_wrapper").classList.toggle("invisible");
  let id = event.target.id;
  let body = JSON.stringify({
    id: id
  });
  if (is_verifiy) {

    var res = await fetch("/admin/dashboard/"+link+"/verifiy/", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });
  } else {

    var res = await fetch("/admin/dashboard/" + link + "/remove/", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: body
    });

  }
  res = await res.json();
  if (res.status === "success") {
    popup_container.style.display = "flex";
    popup_container.children[0].children[0].innerText = res.msg;
    fetchRider();

  } else {
    popup_container.style.display = "flex";
    popup_container.children[0].children[0].innerText = res.msg;
  }

}


function insertToTable(obj, table, is_user = false) {
  let row;
  if (!is_user) {
    row = '<div class="tr">\
  <div class="td"><img src="/rider/profile/' + obj.profile + '" class="rider_img" alt="profile"></div>\
  <div class="td"><a href="/admin/dashboard/rider/id/' + obj.rider_id + '"> ' + obj.ridername + '</a></div>\
  <div class="td">' + new Date(obj.created_at).toDateString() + '</div>\
  <div class="td">' + obj.licenseno + '</div>\
  <div class="td">' + obj.adharNo + '</div>\
  <div class="td">' + obj.is_verified + '</div>\
  <div class="td">\
    <input type="button" class="remove_rider" style="border:0 !important;color: white !important;" value="Remove" id="' + obj.rider_id + '">\
  </div>\
  <div class="td">\
    <input type="button" class="verifiy_rider"style="border:0 !important;color: white !important;" value="Verifiy" id="' + obj.rider_id + '">\
  </div>\
</div>'

  } else {
    row = '<div class="tr">\
  <div class="td"><img src="/user/profile/' + obj.profile + '" class="user_img" alt="profile"></div>\
  <div class="td"><a href="/admin/dashboard/user/id/' + obj.user_id + '"> ' + obj.username + '</a></div>\
  <div class="td">' + obj.email_verified + '</div>\
  <div class="td">' + obj.adharNo + '</div>\
  <div class="td">' + new Date(obj.created_at).toDateString() + '</div>\
  <div class="td">' + obj.is_verified + '</div>\
  <div class="td">\
    <input type="button" class="verifiy_user" style="border:0 !important;color: white !important;" value="Verifiy" id="' + obj.user_id + '">\
  </div>\
  <div class="td">\
    <input type="button" class="remove_user" style="border:0 !important;color: white !important;" value="Remove" id="' + obj.user_id + '">\
  </div>'

  }
  table.innerHTML += row;
}

async function fetchRider() {
  var table = document.querySelector(".table_rider");
  var info_text = document.querySelector(".info_text-rider");
  var children = table.children;
  if (children.length > 1) {
    let length = children.length
    for (let i = 0; i < length - 1; i++) {
      children[1].remove();
    }
  }
  let res = await fetch("/admin/dashboard/riders/");
  res = await res.json();
  if (res.status == "success") {
    if (res["riders"]) {
      if (res["riders"].length > 0) {
        table.style.display = "flex";
        res["riders"].forEach((rider) => {
          let profile = rider["profile"];
          let rider_id = rider["_id"];
          let ridername = rider["name"];
          let email = rider["email"];
          let created_at = rider["created_at"];
          let licenseno = rider["licenseno"];
          let is_verified = rider["is_verified"];
          let adharNo=rider["adharNo"];
          insertToTable({
              profile,
              licenseno,
              rider_id,
              ridername,
              created_at,
              licenseno,
              is_verified,
              adharNo,
            },
            table);
        });
      } else {
        info_text.style.display = "flex";
      }
    }

    //after fetching adding listener
    let remove_rider = document.querySelectorAll(".remove_rider");
    remove_rider.forEach((button) => {
      button.addEventListener("click", (e) => {
        removeRider(e, "rider")
      })
    });
    let verifiy_rider = document.querySelectorAll(".verifiy_rider");
    verifiy_rider.forEach((button) => {
      button.addEventListener("click", (e) => {
        removeRider(e, "rider", true)
      })
    });
  }
}

async function fetchUser() {
  var table = document.querySelector(".table_user");
  var info_text = document.querySelector(".info_text-user");
  var children = table.children;
  if (children.length > 1) {
    let length = children.length
    for (let i = 0; i < length - 1; i++) {
      children[1].remove();
    }
  }
  let res = await fetch("/admin/dashboard/users/");
  res = await res.json();
  if (res.status == "success") {
    if (res["users"]) {
      if (res["users"].length > 0) {
        table.style.display = "flex";
        res["users"].forEach((user) => {
          let user_id = user["_id"];
          let profile = user["profile"];
          let username = user["name"];
          let email = user["email"];
          let email_verified = user["isEmailVerified"];
          let created_at = user["created_at"];
          let whatsappno = user["whatsappno"];
          let adharNo=user["adharNo"];
          let is_verified=user["isVerified"];

          insertToTable({
              profile,
              user_id,
              username,
              email,
              email_verified,
              created_at,
              whatsappno,
              adharNo,
              is_verified
            },
            table, true);
        });
      } else {
        info_text.style.display = "flex";
        console.log("s")
      }
    }

    //after fetching adding listener
    let remove_user = document.querySelectorAll(".remove_user");
    remove_user.forEach((button) => {
      button.addEventListener("click", (e) => {
        removeRider(e, "user")
      })
    });

    let verifiy_user = document.querySelectorAll(".verifiy_user");
    verifiy_user.forEach((button) => {
      button.addEventListener("click", (e) => {
        removeRider(e, "user", true)
      })
    });
  }
}


async function main() {
  //blocking user by loading animation
  document.querySelector(".loading_wrapper").classList.toggle("invisible");
  await fetchRider();
  await fetchUser();
  //after completion remove loading
  document.querySelector(".loading_wrapper").classList.toggle("invisible");

}

main()