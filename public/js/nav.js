function main2(){
	let arrow=document.querySelector(".home_arrow");
	let dropdown_wrapper=document.querySelector(".dropdown_wrapper");
	if(arrow){
	 	arrow.addEventListener("click",showHomeDropDown);
	 	dropdown_wrapper.addEventListener("click",showHomeDropDown);

	 	function showHomeDropDown(){
			 let profile_dropdown=document.querySelector(".home_dropdown");
		 	 arrow.classList.toggle("rotate");
			 profile_dropdown.classList.toggle("invisible");
			 dropdown_wrapper.classList.toggle("invisible");
		}
	}
}


function main(){
 let arrow=document.querySelector(".arrow");
 let dropdown_wrapper=document.querySelector(".dropdown_wrapper");
 if(arrow){
 	 arrow.addEventListener("click",showDropDown);
 	 dropdown_wrapper.addEventListener("click",showDropDown);
	 function showDropDown(){
		 let profile_dropdown=document.querySelector(".profile_dropdown");
		 arrow.classList.toggle("rotate");
		 profile_dropdown.classList.toggle("invisible");
		 dropdown_wrapper.classList.toggle("invisible");
	}
  }
}

main()
main2();