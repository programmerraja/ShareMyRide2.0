async function fetchRide()
{
	let container=document.querySelector(".search_container-result");

	let res=await fetch("/search/ride/");
	let rides =await res.json();
	for(let i=0;i<rides.length;i++){

    		container.innerHTML+='<div class="search_result">\
		<div class="search_result-left">\
			<img src="https://olawebcdn.com/images/v1/cabs/sl/ic_mini.png" alt="vechiles">\
		</div>\
		<div class="search_result-right">\
			<div class="vechile_type font-weight-bold">\
				<p class="text-capitalize m-0">'+rides[i].type+'</p>\
			</div>\
			<div class="search_result-right-location">\
				<div class="location_from text-muted  mx-2">\
					<p class="text-capitalize m-0">'+rides[i].from+'</p>\
				</div>\
				<span><-----></span>\
				<div class="location_to text-muted  mx-2">\
					<p class="text-capitalize m-0">'+rides[i].to+'<p>\
				</div>\
			</div>\
			<div class="search_result-right-detail">\
				<div class="ride_date text-muted mx-2">\
					<p class="text-capitalize m-0">'+new Date(rides[i].date).toDateString()+'</p>\
				</div>\
				<div class="ride_time text-muted mx-2">\
					<p class="text-capitalize m-0">'+rides[i].time+'</p>\
				</div>\
			</div>\
		</div>\
		<div class="search_result-link">\
				<a href="/search?id='+rides[i]._id+'">\
					<div class="search_result-arrow"></div>\
				</a>\
		</div>\
	</div>'
	}
}


function main()
{
	fetchRide();   
}

main();