let file = "atag.json"
let atagContents = null;
let dbug = !true;
let cont = null;
let parts = true;
let principles = true;
let guidelines = true;
let sc = true;
let notes = true;
let initHl = 3;
let hl = initHl;
let showImplementation = true;
let showURL = true;
let refURL = null;
let implementURL = null;
let liveRegion = null;
let sep="|";

let filters = {
	"partChk" : null,
	"principleChk" : null,
	"guidelineChk" : null,
	"rationaleChk" : null,
	"successCriterionChk" : null,
	"descriptionChk" : null,
	"levelChk" : null,
	"levelAAAChk" : null,
	"levelAAChk" : null,
	"levelAChk" : null,
	"infoLinkChk" : null,
	"implementingLinkChk" : null,
	"scnotesChk" : null,
	"glnotesChk" : null,
	"partAChk" : null,
	"partBChk" : null
};


function init () {
	if (dbug) console.log ("Initting");
	cont = document.getElementById("cont");
	liveRegion = document.getElementById("liveRegion");

	
	let params = (new URL(document.location)).searchParams;
	let hide = null;
	if (params.get("filters")) {
		// Do stuff
		hide = params.get("filters");
		
	} else {
		// Nothing is filtered, therefore, leave everything as it is
	}
	if (dbug) console.log ("Hiding: " + hide + ".");
	
	for (let id in filters) {
		try {
			filters[id] = document.getElementById(id);
			filters[id].addEventListener("change", toggleFilter, false);
			if (hide) {
				if (dbug) console.log (`Chould I hide ${id}?`);
				if (id.replace("Chk", "").match(hide)) filters[id].checked = false;
			}
		}
		catch (ex) {
			console.error ("Exception: " + ex.toString())
		}
	}
	window.addEventListener("popstate", setFilters, false);
	fetch (file).then(function (resp) {
		if (dbug) console.log ("Got resp.");
		resp.json().then (setATAG);
	})

	if (dbug) console.log ("Finished Initting");
} // End of init

function setFilters () {
	if (dbug) console.log ("popstate event with url: " + document.location.href);
	let msg = "";
	let hide = null;
	let showing = [];	// hiding and showing are for the aria-live region
	let hiding = [];
	let params = (new URL(document.location)).searchParams;
	if (params.get("filters")) {
		// Do stuff
		hide = params.get("filters");
	} else {
		// Nothing is filtered, therefore, leave everything as it is
	}
	for (let id in filters) {
		let chkLbl = document.querySelector("label[for=" + id + "]").textContent;
		if (dbug) console.log ("Checking " + id + " (" + chkLbl + ").");
		if (hide) {
			if (id.replace("Chk", "").match(hide)) {
				if (dbug) console.log ("It should be hidden.");
				if (filters[id].checked) {
					hiding.push (chkLbl);
					filters[id].checked = false;
				} else {
					if (dbug) console.log ("Leaving unchecked.");
				}
				//filters[id].checked = (id.replace("Chk", "").match(hide) ? false : true);
			} else {
				if (dbug) console.log ("It should not be hidden.");
				if (!filters[id].checked) {
					showing.push (chkLbl);
					filters[id].checked = true;
				} else {
					if (dbug) console.log ("Leaving checked.");
				}
			}
		} else {
			if (dbug) console.log ("Everything should be checked (unhidden) including " + chkLbl + ".");
			if (!filters[id].checked) {
				if (dbug) console.log ("Checking.");
				showing.push (chkLbl);
				filters[id].checked = true;
			} else {
				if (dbug) console.log ("Leaving as is.");
			}
		}
	}
	if (showing.length > 0 || hiding.length > 0) {
		msg = "";
		if (showing.length > 0) {
			msg = "Showing " + showing.join(", ") + ".";
		}
		if (hiding.length > 0) {
			msg += "Hiding " + hiding.join(", ") + ".";
		}
	} else {
		msg = "Showing everything!";
	}

	liveRegion.textContent = msg;
} // End of setFilters

function setATAG (atag) {
	atagContents = atag;
	genHTML();
} // End of set ATAG

function toggleFilter (e) {
	let chkID = e.target.getAttribute("id");
	let chkClass = chkID.replace("Chk", "");
	let chkLbl = document.querySelector("label[for=" + chkID + "]");
	let msg = [];
	msg.push((filters[chkID].checked ? "Showing " : "Hiding ") + chkLbl.textContent);

	if (chkID == "partChk" || chkID == "principleChk") {
	} else if (chkID == "guidelineChk") {
		filters["glnotesChk"].checked = filters["guidelineChk"].checked;
		filters["rationaleChk"].checked = filters["guidelineChk"].checked;
		//msg += ", " + document.querySelector("label[for=glnotesChk]").textContent + ", and " + document.querySelector("label[for=rationaleChk]").textContent;
		msg.push(document.querySelector("label[for=glnotesChk]").textContent, document.querySelector("label[for=rationaleChk]").textContent);
	} else if (chkID == "successCriterionChk") {
		filters["descriptionChk"].checked = filters["successCriterionChk"].checked;
		filters["levelChk"].checked = filters["successCriterionChk"].checked;
		filters["levelAChk"].checked = filters["successCriterionChk"].checked;
		filters["levelAAChk"].checked = filters["successCriterionChk"].checked;
		filters["levelAAAChk"].checked = filters["successCriterionChk"].checked;
		filters["scnotesChk"].checked = filters["successCriterionChk"].checked;
		msg.push(document.querySelector("label[for=descriptionChk]").textContent, document.querySelector("label[for=levelChk]").textContent, document.querySelector("label[for=scnotesChk]").textContent);
	} else if (chkID == "levelChk") {
		msg.push(document.querySelector("label[for=levelChk]").textContent);
	} else if (chkID.match(/level(WC)?A/)) {	// If a specific level is clicked...
		if (filters[chkID].checked) {		// ...and it's been turned on....
			if (!filters["levelChk"].checked) filters["levelChk"].checked = true;
			msg.push(document.querySelector("label[for=levelChk]").textContent);
		} else {
			// This is just to turn everything off if now all levels are unchecked.  If one gets turned on, we'll deal with that below.
			if (!filters["levelAChk"].checked && !filters["levelAAChk"].checked && !filters["levelAAAChk"].checked) {
				// If no levels are checked, then....well....no SC's should be shown!
				if (filters["levelChk"].checked) {
					filters["levelChk"].checked = false;
					msg.push(document.querySelector("label[for=levelChk]").textContent);
				}
				if (filters["successCriterionChk"].checked) {
					filters["successCriterionChk"].checked = false;
					msg.push(document.querySelector("label[for=successCriterionChk]").textContent);
				}
				if (filters["scnotesChk"].checked) {
					filters["scnotesChk"].checked = false;
					msg.push(document.querySelector("label[for=scnotesChk]").textContent);
				}
				if (filters["descriptionChk"].checked) {
					filters["descriptionChk"].checked = false;
					msg.push(document.querySelector("label[for=descriptionChk]").textContent);
				}

			}
		}
	}
	// If guideline subsections turn on, make sure guidelines are on
	if ((filters["rationaleChk"].checked || filters["glnotesChk"].checked) && !filters["guidelineChk"].checked) {
		filters["guidelineChk"].checked = true;
		msg.push (document.querySelector("label[for=guidelineChk]").textContent);
	}

	// If SC subsections turn on, make sure SC is on
	if ((filters["descriptionChk"].checked || filters["levelChk"].checked || filters["scnotesChk"].checked || filters["levelAChk"].checked || filters["levelAAChk"].checked || filters["levelAAAChk"].checked) && !filters["successCriterionChk"].checked) {
		filters["successCriterionChk"].checked = true;
		msg.push(document.querySelector("label[for=successCriterionChk]").textContent);
	}

	let url = new URL(document.location);
	let newURL = url.toString().replace(/#.*$/, "");
	newURL = newURL.replace(/\?.*$/, "");
	let params = [];
	for (let id in filters) {
		if (!filters[id].checked) {
			params.push(id.replace("Chk", ""));
			if (id.match(/levelA/)) {
				params[params.length-1] += "$";
			}
		}
	}
	if (params.length > 0) {
		newURL += "?filters=" + params.join(sep) + url.hash;
	} else {
		newURL += url.hash
	}
	history.pushState({}, document.title, newURL);
		
	genHTML();
	if (msg.length > 1) msg[msg.length-1] = "and " + msg[msg.length-1];
	liveRegion.textContent = msg.join(", ") + ".";
} // End of toggleFilter

function genHTML () {
	if (dbug) console.log ("Regening...");
	cont.innerHTML = "";
	hl = initHl;
	refURL = atagContents["base_url"];
	implementURL = atagContents["implementation_base_url"];
	for (let part in atagContents.parts) {
		if (parts && filters["part" + atagContents.parts[part]["ref_id"] + "Chk"].checked) createPart(atagContents.parts[part], cont);
	}
} // End of genHTML
function createPart (atagPart, pNode) {
	let partSect = pNode;
	if (filters["partChk"].checked) partSect  = createHTMLElement(document, "section", {"parentNode":pNode,"class":"partSect", "id":atagPart["url_fragment"]});
	if (!filters["infoLinkChk"].checked && !filters["implementingLinkChk"].checked && filters["partChk"].checked && !filters["guidelineChk"].checked && !filters["successCriterionChk"].checked && !filters["principleChk"].checked) {
		createHTMLElement(document, "p", {"parentNode":partSect, "class":"part bold", "textNode":"Part " + atagPart["ref_id"] + " - " + atagPart["title"]});
	} else {
		if (filters["partChk"].checked) {
			createHTMLElement(document, "h" + hl, {"parentNode":partSect, "class":"part", "textNode":"Part " + atagPart["ref_id"] + " - " + atagPart["title"]});
			if (filters["infoLinkChk"].checked || filters["implementingLinkChk"].checked) createLinks(partSect, atagPart["url_fragment"]);
			if (filters["implementingLinkChk"].checked) implementingURL = createHTMLElement (document, "a", {"parentNode":partSect, "href":implementURL + "#" + atagPart["url_fragment"], "textNode":"Implementing " + atagPart["ref_id"], "class":"implementingLink", "target":"_blank", "rel":"noopener noreferrer"});
			if (filters["infoLinkChk"].checked) createHTMLElement(document, "a", {"parentNode":partSect, "href":refURL + "#" + atagPart["url_fragment"], "textNode":refURL+"#"+atagPart["url_fragment"], "class":"infoLink", "target":"_blank", "rel":"noopener noreferrer"});
			hl++;
		}
		for (let p in atagPart["principles"]) {
			createPrinciple(atagPart["principles"][p], partSect);
		}
		if (filters["partChk"].checked) hl--;
	}
} // End of createPart


function createPrinciple (atagPrinciple, pNode) {
	let principleSect = pNode;
	let gls = false;
	if (filters["principleChk"].checked) principleSect  = createHTMLElement(document, "section", {"parentNode":pNode, "class":"prinicpleSect", "id":atagPrinciple["url_fragment"]});
	if (!filters["infoLinkChk"].checked && !filters["implementingLinkChk"].checked && !filters["guidelineChk"].checked && !filters["successCriterionChk"].checked&& filters["principleChk"].checked) {
		createHTMLElement(document, "p", {"parentNode":principleSect, "class":"principle bold", "textNode":"Principle " + atagPrinciple["ref_id"] + " - " + atagPrinciple["title"]});
	} else {
		if (filters["principleChk"].checked) {
			createHTMLElement(document, "h" + hl, {"parentNode":principleSect, "class":"principle", "textNode":"Principle " + atagPrinciple["ref_id"] + " - " + atagPrinciple["title"]});
			if (filters["infoLinkChk"].checked || filters["implementingLinkChk"].checked) createLinks(principleSect, atagPrinciple["url_fragment"]);
			hl++;
		}
		for (let gl in atagPrinciple["guidelines"]) {
			let scs = createGuideline(atagPrinciple["guidelines"][gl], principleSect);
			if (!gls && scs) gls = true;
		}
		if (filters["principleChk"].checked) hl--;
		/*
		if (!gls) {
			principleSect.parentNode.removeChild(principleSect);
		}
		*/
	}

} // End of createPrinciple

function createGuideline (atagGuideline, pNode) {
	let guidelineSect  = pNode;
	let scs = false;
	if (filters["guidelineChk"].checked) guidelineSect = createHTMLElement(document, "section", {"parentNode":pNode,"class":"guidelineSect", "id":atagGuideline["url_fragment"]});
	if (!filters["infoLinkChk"].checked && !filters["implementingLinkChk"].checked && !filters["rationaleChk"].checked && !filters["successCriterionChk"].checked && filters["guidelineChk"].checked && (!filters["glnotesChk"].checked || (filters["glnotesChk"].checked && !atagGuideline["notes"]))) {
		createHTMLElement(document, "p", {"parentNode":guidelineSect, "class":"guideline bold", "textNode":"Guideline " + atagGuideline["ref_id"] + " - " + atagGuideline["title"]});
	} else {
		if (filters["guidelineChk"].checked) {
			createHTMLElement(document, "h" + hl, {"parentNode":guidelineSect, "class":"guideline", "textNode":"Guideline " + atagGuideline["ref_id"] + " - " + atagGuideline["title"]});
			if (filters["infoLinkChk"].checked || filters["implementingLinkChk"].checked) createLinks(guidelineSect, atagGuideline["url_fragment"]);
			if (filters["rationaleChk"].checked) createHTMLElement(document, "p", {"parentNode":guidelineSect, "class":"rationale", "textNode":"Rationale: " + atagGuideline["rationale"]});
			if (atagGuideline["notes"] && filters["glnotesChk"].checked) {
				hl++;
				let guidelineNotesSect = createHTMLElement(document, "section", {"parentNode":guidelineSect, "class":"guidelineNotesSect"});
				let guidelineNotesH = createHTMLElement(document, "h" + hl, {"parentNode":guidelineNotesSect, "textNode":"Notes", "class":"glnotes","id":atagGuideline["ref_id"]+"H"});
				let guidelineNotesOL = createHTMLElement(document, "ol", {"parentNode":guidelineNotesSect, "class":"guidelineNotes", "aria-labelledby":atagGuideline["ref_id"]+"H", "class":"glnotes"});
				for (let i = 0; i < atagGuideline["notes"].length; i++) {
					let glLi = createHTMLElement(document, "li", {"parentNode":guidelineNotesOL, "textNode":atagGuideline["notes"][i]["content"]});
				}
				hl--;
			}
			hl++;
		}
		for (let sc in atagGuideline["success_criteria"]) {
			if (filters["levelAChk"].checked || filters["levelAAChk"].checked || filters["levelAAAChk"].checked) {
				if (atagGuideline["success_criteria"][sc]["level"] == "A,AA,AAA") {
					if (!scs) scs = true;
					createSuccessCriterion(atagGuideline["success_criteria"][sc], guidelineSect);
				} else if (filters["level" + atagGuideline["success_criteria"][sc]["level"] + "Chk"].checked) {
					if (!scs) scs = true;
					createSuccessCriterion(atagGuideline["success_criteria"][sc], guidelineSect);
				}
			}
		}
		if (filters["guidelineChk"].checked) hl--;
		/*
		if (!scs) {
			// This Guideline has no Success Criteria to be shown.  Hide it.
			guidelineSect.parentNode.removeChild(guidelineSect);
		}
		*/
	return scs;
	}
} // End of createGuideline

function createSuccessCriterion (atagSuccessCriterion, pNode) {
	let successCriterionSect = pNode;	// This may not be necessary here.  But I'm keeping it as per the pattern.
	if (filters["successCriterionChk"].checked) {
		successCriterionSect  = createHTMLElement(document, "section", {"parentNode":pNode, "class":"scSect", "id":atagSuccessCriterion["url_fragment"]});
		if (!filters["infoLinkChk"].checked && !filters["implementingLinkChk"].checked && (!filters["scnotesChk"].checked || !atagSuccessCriterion["notes"]) && !filters["descriptionChk"].checked && !filters["levelChk"].checked) {
			let successCriterionH = createHTMLElement(document, "p", {"parentNode":successCriterionSect, "class":"successCriterion bold", "textNode":"Success Criterion " + atagSuccessCriterion["ref_id"] + " - " + atagSuccessCriterion["title"]});
		} else {
			let successCriterionH = createHTMLElement(document, "h" + hl, {"parentNode":successCriterionSect, "class":"successCriterion", "textNode":"Success Criterion " + atagSuccessCriterion["ref_id"] + " - " + atagSuccessCriterion["title"]});
			if (filters["descriptionChk"].checked) {
				let scdescDiv = createHTMLElement(document, "div", {"parentNode":successCriterionSect, "class":"descriptionDiv"});
				let scdesc = createHTMLElement(document, "p", {"parentNode":scdescDiv, "textNode" : atagSuccessCriterion["description"], "class":"description"});
				if (atagSuccessCriterion["special_cases"]) {
					let specCaseOL = createHTMLElement(document, "ol", {"parentNode":scdescDiv, "class":"description"});
					for (let i = 0; i < atagSuccessCriterion["special_cases"].length; i++) {
						let specCaseLI = createHTMLElement(document, "li", {"parentNode":specCaseOL});
						let specCaseTitle = createHTMLElement(document, "strong", {"parentNode":specCaseLI, "textNode":atagSuccessCriterion["special_cases"][i]["title"]});
						let specCaseDesc = createHTMLElement(document, "span", {"parentNode":specCaseLI, "textNode":atagSuccessCriterion["special_cases"][i]["description"]});
					}
				}
			}
			if (filters["levelChk"].checked) createHTMLElement(document, "p", {"parentNode":successCriterionSect, "class":"level", "textNode":"Level " + atagSuccessCriterion["level"]});
			if (filters["infoLinkChk"].checked || filters["implementingLinkChk"].checked) createLinks(successCriterionSect, atagSuccessCriterion["url_fragment"]);
			if (filters["scnotesChk"].checked && atagSuccessCriterion["notes"]) {
				hl++;
				let successCriterionNotesSect = createHTMLElement(document, "section", {"parentNode":successCriterionSect, "class":"successCriterionSect"});
				let successCriterionNotesH = createHTMLElement(document, "h" + hl, {"parentNode":successCriterionNotesSect, "textNode":"Notes", "class":"scnotes", "id":atagSuccessCriterion["ref_id"]+"H"});
				let successCriterionNotesOL = createHTMLElement(document, "ol", {"parentNode":successCriterionNotesSect, "class":"successCriterionNotes", "aria-labelledby":atagSuccessCriterion["ref_id"]+"H", "class":"scnotes"});
				for (let i = 0; i < atagSuccessCriterion["notes"].length; i++) {
					createHTMLElement(document, "li", {"parentNode":successCriterionNotesOL, "textNode":atagSuccessCriterion["notes"][i]["content"]});
				}
				hl--;
			}
		}
	}
} // End of createSuccessCriterion

function createLinks (pNode, urlFragment) {
	let newUl = createHTMLElement(document, "ul", {"parentNode": pNode, "class":"linkUL"});

	if (filters["infoLinkChk"].checked) {
		let newLi =createHTMLElement(document, "li", {"parentNode":newUl});
		createHTMLElement(document, "a", {"parentNode":newLi, "href":refURL + "#" + urlFragment, "textNode":refURL+"#"+urlFragment, "class":"infoLink", "target":"_blank", "rel":"noopener noreferrer"});
	}
	if (filters["implementingLinkChk"].checked) {
		let newLi =createHTMLElement(document, "li", {"parentNode":newUl});
		createHTMLElement(document, "a", {"parentNode":newLi, "href":implementURL + "#" + urlFragment, "textNode":implementURL+"#"+urlFragment, "class":"infoLink", "target":"_blank", "rel":"noopener noreferrer"});
	}

} // End of createLinks

function createHTMLElement (creator, type, attribs) {
	let thisdbug = (((arguments.length == 4 &&arguments[3] != null && arguments[3] != undefined) || dbug == true) ? true : false);
	//console.log ("createHTMLElement::dbug: " + dbug + " because arguments.length: " + arguments.length + ", and argument[3]: " + arguments[3] + ".");
	if (thisdbug) console.log("nordburg::createHTMLElement " + type + (attribs.hasOwnProperty("id") ? "#" + attribs["id"] : "") + (attribs.hasOwnProperty("textNode") ? " containing " + attribs["textNode"] : "") + ".");
	// From: http://stackoverflow.com/questions/26248599/instanceof-htmlelement-in-iframe-is-not-element-or-object
	let iwin = window.top;
	// idiv instanceof iwin.HTMLElement; // true
	// Check for headings beyond h6
	let hRE = /h(\d+)/g;
	let hLevel = hRE.exec(type);
	if (hLevel) {
		if (hLevel[1] > "6") {
			type= "div";
			attribs["role"] = "heading";
			attribs["aria-level"] = hLevel[1];
		}
	}

	let newEl = creator.createElement(type);
	for (let k in attribs) {
		if (thisdbug) console.log ("Checking attrib " + k + ".");
		if (k == "parentNode" && attribs[k] instanceof iwin.HTMLElement) {
			if (thisdbug) console.log("Dealing with parentnode.");
			if (attribs[k] instanceof HTMLElement) {
				if (thisdbug) console.log("Appending...");
				attribs[k].appendChild(newEl);
			} else if (attribs[k] instanceof String || typeof(attribs[k]) === "string") {
				try {
					if (thisdbug) console.log("Getting, then appending...");
					document.getElementById(attribs[k]).appendChild(newEl);
				}
				catch (er) {
					console.error("Error creating HTML Element: " + er.message + ".");
				}
			}
		} else if (k == "textNode" || k == "nodeText") {
			if (typeof (attribs[k]) == "string") {
				newEl.appendChild(creator.createTextNode(attribs[k]));
			} else if (attribs[k] instanceof iwin.HTMLElement) {
				newEl.appendChild(attribs[k]);
			} else {
				newEl.appendChild(creator.createTextNode(attribs[k].toString()));
			}
		} else {
			newEl.setAttribute(k, attribs[k]);
		}
	}
	return newEl;
} // End of createHTMLElement


init();
