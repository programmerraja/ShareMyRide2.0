function showDropDown(e){
	if(!(e===false)){
		let index=e.target.attributes.index.value;
		let dropdown=document.querySelector(".index"+index);
		let myrides_wrapper=document.querySelector(".myrides_wrapper");
		dropdown.classList.toggle("invisible");
		myrides_wrapper.classList.toggle("invisible");
		dropdown.classList.add("active_drop");
	}
	else{
		let dropdown=document.querySelector(".active_drop");
		let myrides_wrapper=document.querySelector(".myrides_wrapper");
	
		dropdown.classList.toggle("invisible");
		myrides_wrapper.classList.toggle("invisible");

		dropdown.classList.remove("active_drop");
	}

}

async function removeRide(e){
	//blocking user
	document.querySelector(".loading_wrapper").classList.toggle("invisible");
	let id=e.target.attributes.id.value;
	let popup_container=document.querySelector(".popup_container");
	if(id){
			let body=JSON.stringify({"id":id});
			let res=await fetch("/user/unbook/ride/",{
													method:"post",
													headers:{"Content-Type":"application/json"},
													body:body
												}
									);

			res=await res.json();
			if(res.status==="Sucess"){
				popup_container.style.display="flex";
				popup_container.children[0].children[0].innerText=res.msg;	
				e.target.parentElement.parentElement.parentElement.style.display="none";
			}
			else{
				popup_container.style.display="flex";
				popup_container.children[0].children[0].innerText=res.msg;	
				
			}
	}

}
function main(){
	let dot=document.querySelectorAll(".myrides-dot");
	
	let myrides_wrapper=document.querySelector(".myrides_wrapper");
	myrides_wrapper.addEventListener("click",()=>{showDropDown(false)});

	for(let i=0;i<dot.length;i++){
		dot[i].addEventListener("click",(e)=>{showDropDown(e)});
	}
	let remove_text=document.querySelectorAll(".myrides_dropdown-option1");
	if(remove_text){
		for(let i=0;i<dot.length;i++){
			remove_text[i].addEventListener("click",(e)=>{removeRide(e)});
		}
	}

}
main()