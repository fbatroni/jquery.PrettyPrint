var NARegions = {
	CA: 'CA', 
	US: 'US', 
	AG: 'AG', 
	AI: 'AI', 
	AS: 'AS', 
	BB: 'BB', 
	BM: 'BM', 
	BS: 'BS', 
	DM: 'DM', 
	DO: 'DO', 
	GD: 'GD', 
	GU: 'GU', 
	JM: 'JM', 
	KN: 'KN', 
	KY: 'KY', 
	LC: 'LC', 
	MP: 'MP', 
	MS: 'MS', 
	PR: 'PR', 
	SX: 'SX', 
	TC: 'TC', 
	TT: 'TT', 
	VC: 'VC', 
	VG: 'VG', 
	VI: 'VI'
};
var positiveFilters = {
  //International Vega numbers

  vega_de_regex: /\+49\d{8,12}/g,
  vega_fr_regex: /\+3[23]\d{8,11}/g,
  vega_ir_regex: /\+35\d{8,11}/g,
  vega_pretty_print_regex: /\+\d{8,15}/g,
  
  //Reference: https://en.wikipedia.org/wiki/Telephone_numbers_in_the_United_Kingdom
  
  //UK - overseas
  uk_dundee_oxford_swansea: /\+44\s\d{4}\s\d{6}/g,
  uk_evesham: /\+44\s\d{4}\s\d{5}/g,
  //UK - from_uk
  uk_from_uk_dundee_oxford_swansea: /\(\d{5}\)\s\d{6}/g,
  main_uk_regex: /\(?(?:(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?\(?(?:0\)?[\s-]?\(?)?|0)(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}|\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4}|\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3})|\d{5}\)?[\s-]?\d{4,5}|8(?:00[\s-]?11[\s-]?11|45[\s-]?46[\s-]?4\d))(?:(?:[\s-]?(?:x|ext\.?\s?|\#)\d+)?)/g,
  
  //German Matches
  main_de_regex: /^(((((((00|\+)49[ \-\/]?)|0)[1-9][0-9]{1,4})[ \-\/]?)|((((00|\+)49\()|\(0)[1-9][0-9]{1,4}\)[ \-\/]?))[0-9]{1,7}([ \-\/]?[0-9]{1,5})?)/g,
  //France matches
  fr_regex_spaces: /\+3[23]\s\d{1}\s\d{2}\s\d{2}\s\d{2}\s\d{2}/g,

  //Ireland matches
  
  //Vega normalized numbers regex
  //US regex
  us_vega_pretty_print: /\+1-\(\d{3}\)-\d{3}-\d{4}/g,
  verbose_test_with_space: /1-\(\d{3}\)-\d{3}\s\d{4}/g,
  verbose_test_with_dash: /1-\(\d{3}\)-\d{3}-\d{4}/g,
  canonical_us: /(\+1)?\s?\(\d{3}\)-\d{3}-\d{4}/g,
  us_spaces_without_parens: /\d{3}\s\d{3}\s\d{4}/g,
  us_spaces_with_parens: /\(\d{3}\)\s\d{3}\s\d{4}/g,
  david_test: /(\+1)?\s?\(\d{3}\)\s\d{3}-\d{4}/g,
  dashes: /\d{3}-\d{3}-\d{4}/g,
  dots: /\d{3}\.\d{3}\.\d{4}/g,
  us_one_dash: /\+1\s\d{3}\s\d{3}-\d{4}/g,
  us_no_spaces_w_dash: /\+1\s\(\d{3}\)\d{3}-\d{4}/g,
  us_parens_no_space_single_dash: /\(\d{3}\)\d{3}-\d{4}/g,
  us_no_space_no_dash: /\+1\s\d{3}\s\d{7}/g,
  us_all_spaces: /\+1\s\d{3}\s\d{3}\s\d{4}/g
};


var negativeFilters = {
  textTooLong: function(match){
    return cleanPhone(match.text).length > 16;
  },
  textTooShort: function(match){
    for(var i=0; i< match.matches.length; i++){
      if(cleanPhone(match.matches[i]).length < 10){
        return true;
      }
    }
  },
  bogusNumber: /\(555\)-555-5555/g,
  bogusVegaNumber: /000-000-0000/g,
  textIsNumeric: /^[0-9]{1,45}$/g
};


(function($) {
  var methods = {

    

    phone: function(options) {
       	var opts = jQuery.extend({}, jQuery.fn.PrettyPrint.phone.defaults, options);
       	return formatPhoneNumber(this);

    	function formatPhoneNumber(node) {
    		if(opts.auto == true){
    			autoFormat(node);
    		}else{
    			return specificFormat($(node).val(), opts.detailed);
    		}
    		
		}

		function autoFormat(node){
			var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance(); 
			$(node).map(function() {
				var textNodes = getTextNodesIn(this);
		        $.each(textNodes, function(index, node) {
		          var text = node.nodeValue;
		          if (text.length > 0 && text !== "") {
		            var possiblePhone = isPossiblePhone(text);
		            if(possiblePhone && isValidPhone(possiblePhone)){
		            	$.each(possiblePhone.matches, function(k,phoneText){
		            	   var e164 = parseE164(phoneText).e164;
		            	   var region = parseE164(e164).region;
	            		   if( region !== NARegions[region]){
	            		   	//console.log(phoneText, region);
	            		   		node.nodeValue =  node.nodeValue.replace(phoneText, e164 );
	            		   }else{
	            		   	  node.nodeValue =  node.nodeValue.replace(phoneText, prettyNumberDisplay(e164));
	            		   }
	            		   
		            	});
		            	$(node).replaceWith(node.nodeValue);         
		            }
		          }
		        });
		    });
		
		function prettyNumberDisplay(text){
			var iac = text.substr(0,2);
			var cc = text.substr(2, 3);
			var ndc = text.substr(4, 3);
			var sn = text.substr(8, 4);
			var output = iac + "-(" + cc + ")-" + ndc + "-" + sn; 

			console.log(output);
			// +15551231234
			// +1-(760)-519-4565
			return output;
		}

		function parseE164(text){
			var output;
			try{
				var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance(); 
				var number = phoneUtil.parseAndKeepRawInput(text, opts.regionCode);     
				var isNumberValid = phoneUtil.isValidNumber(number); 
				var PNF = i18n.phonenumbers.PhoneNumberFormat;
				output = {
					e164: phoneUtil.format(number, PNF.E164),
					region: phoneUtil.getRegionCodeForNumber(number)
				};
				//console.log(text, output);
			}catch(e){
				output = {
					e164: text,
					region: null
				}

			}

			return output;

		}

		}

		

		function getTextNodesIn(n) {
        var textNodes = [],
          whitespace = /^\s*$/;

        function getTextNodes(node) {
          if (node.nodeType == 3) {
	          if (!whitespace.test(node.nodeValue)) {
	            textNodes.push(node);
	          }
	       } else { // not text:
	          	for (var i = 0, len = node.childNodes.length; i < len; ++i) {
	            	getTextNodes(node.childNodes[i]);
	       		}
        	}
        }
        getTextNodes(n);
        return textNodes;
      };

        function isPossiblePhone(text) {
          var matches;
          for (var re in positiveFilters) {
            if(matches = text.match(positiveFilters[re]) ) {
              return {text: text, matches: matches}
            };

          }
          return false;
        }
        function isValidPhone(match) {
          for (var filter in negativeFilters) {
            if ($.isFunction(negativeFilters[filter])) {
              if (negativeFilters[filter](match)) {
                return false;
              } 
            } else { //not a function
              if (match.text.match(negativeFilters[filter])) {
                return false;
              }
            }
          } // todo: this for loop can probably be cleaned up with map, reduce, or a filter or something.
          return true;
        }
		function specificFormat(text, detailed){
			try{
				var parsedPhoneNumberOutput = {};
				var phoneNumberText = text;
				var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance(); 
				var number = phoneUtil.parseAndKeepRawInput(phoneNumberText, opts.regionCode); 
			    var isPossible = phoneUtil.isPossibleNumber(number);  
			    parsedPhoneNumberOutput["originalNumber"] = phoneNumberText;
			    parsedPhoneNumberOutput["countryCode"] = opts.regionCode;
			    parsedPhoneNumberOutput["isPossibleNumber"] = isPossible;
			    if (!isPossible) { 
		            output.append('\nResult from isPossibleNumberWithReason(): '); 
		            var PNV = i18n.phonenumbers.PhoneNumberUtil.ValidationResult; 
		            switch (phoneUtil.isPossibleNumberWithReason(number)) { 
		                case PNV.INVALID_COUNTRY_CODE: parsedPhoneNumberOutput["inValidNumberReason"] = "INVALID_COUNTRY_CODE";
		                    break;
		                case PNV.TOO_SHORT: parsedPhoneNumberOutput["inValidNumberReason"] = "TOO_SHORT"; 
		                    break; 
		                case PNV.TOO_LONG: parsedPhoneNumberOutput["inValidNumberReason"] = "TOO_LONG";
		                    break; 
	                }
	                // IS_POSSIBLE shouldn't happen, since we only call this if _not_ 
	                // possible. output.append('\nNote: numbers that are not possible have type ' + 'UNKNOWN, an unknown region, and are considered invalid.'); 
	            } else { 
	                var isNumberValid = phoneUtil.isValidNumber(number); 
	                parsedPhoneNumberOutput["isNumberValid"] = isNumberValid;
	                if (isNumberValid && opts.regionCode && opts.regionCode != 'ZZ') { 
	                    parsedPhoneNumberOutput["isValidNumberForRegion"] = phoneUtil.isValidNumberForRegion(number, opts.regionCode);
	                }
	                parsedPhoneNumberOutput["PhoneNumberRegion"] = phoneUtil.getRegionCodeForNumber(number);
	                var PNT = i18n.phonenumbers.PhoneNumberType; 
	                switch (phoneUtil.getNumberType(number)) { 
	                    case PNT.FIXED_LINE: parsedPhoneNumberOutput["PhoneNumberType"] = "FIXED_LINE";  
	                        break; 
	                    case PNT.MOBILE: parsedPhoneNumberOutput["PhoneNumberType"] = "MOBILE";  
	                        break; 
	                    case PNT.FIXED_LINE_OR_MOBILE: parsedPhoneNumberOutput["PhoneNumberType"] = "FIXED_LINE_OR_MOBILE";  
	                        break; 
	                    case PNT.TOLL_FREE: parsedPhoneNumberOutput["PhoneNumberType"] = "TOLL_FREE"; 
	                        break; 
	                    case PNT.PREMIUM_RATE: parsedPhoneNumberOutput["PhoneNumberType"] = "PREMIUM_RATE";
	                        break; 
	                    case PNT.SHARED_COST: parsedPhoneNumberOutput["PhoneNumberType"] = "SHARED_COST"; 
	                        break; 
	                    case PNT.VOIP:  parsedPhoneNumberOutput["PhoneNumberType"] = "VOIP";  
	                        break; 
	                    case PNT.PERSONAL_NUMBER: parsedPhoneNumberOutput["PhoneNumberType"] = "PERSONAL_NUMBER"; 
	                        break; 
	                    case PNT.PAGER: parsedPhoneNumberOutput["PhoneNumberType"] = "PAGER";
	                        break; 
	                    case PNT.UAN: parsedPhoneNumberOutput["PhoneNumberType"] = "UAN"; 
	                        break; 
	                    case PNT.UNKNOWN: parsedPhoneNumberOutput["PhoneNumberType"] = "UNKNOWN";
	                        break; 
	                    } 
	                } 
	                var PNF = i18n.phonenumbers.PhoneNumberFormat; 
	                parsedPhoneNumberOutput["E164"] = isNumberValid ? phoneUtil.format(number, PNF.E164) : 'invalid';
	                parsedPhoneNumberOutput["OriginalFormat"] = phoneUtil.formatInOriginalFormat(number, opts.regionCode);
	                parsedPhoneNumberOutput["NationalFormat"] = phoneUtil.format(number, PNF.NATIONAL);
	                parsedPhoneNumberOutput["InternationalFormat"] = isNumberValid ? phoneUtil.format(number, PNF.INTERNATIONAL) : 'invalid';
	                parsedPhoneNumberOutput["OutOfCountryFormatFromUS"] = isNumberValid ? phoneUtil.formatOutOfCountryCallingNumber(number, 'US') : 'invalid';
	                parsedPhoneNumberOutput["OutOfCountryFormatFromSwitzerLand"] = isNumberValid ? phoneUtil.formatOutOfCountryCallingNumber(number, 'CH') : 'invalid';
	                 
	                if (opts.carrierCode.length > 0) { 
	                    parsedPhoneNumberOutput["NationalFormatWithCarrierCode"] = phoneUtil.formatNationalNumberWithCarrierCode(number, carrierCode);
	                }	
            } catch (e) { 
                console.log('\n' + e); 
            } 
            if(detailed ==  false){
            	parsedPhoneNumberOutput = isNumberValid ? phoneUtil.format(number, PNF.E164) : 'invalid';
            }else{
            	parsedPhoneNumberOutput = JSON.stringify(parsedPhoneNumberOutput);
            }
            return parsedPhoneNumberOutput;
		}
  	}
	
  }
  $.PrettyPrint = $.fn.PrettyPrint = function(method) {
    self = this;
    var returns;
    if (methods[method]) {
    	returns = methods[method].apply(self, Array.prototype.slice.call(arguments, 1));
    }else if (!method) {
    	throw new Error('WebDialer must receive a method to call as first argument');
    }else {
    	throw new Error('Method ' + method + ' does not exist on WebDialer');
    }
    return returns !== undefined ? returns : this;
  }

  $.fn.PrettyPrint.phone = {
	  	defaults: {
		  regionCode: "US",
		  detailed: false,
		  carrierCode: ""
	  }
  }

})(jQuery);
