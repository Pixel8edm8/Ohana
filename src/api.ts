export async function loadDatabase() 
{  
  try 
  {
    const networkResponse = await fetch('http://localhost:3000/api/items');
    
    const rawXmlTextString = await networkResponse.text();
    const xmlTranslatorEngine = new DOMParser();
    const parsedXmlDocument = xmlTranslatorEngine.parseFromString(rawXmlTextString, 'application/xml');
    const allPersonFields = parsedXmlDocument.querySelectorAll('person');

	const visualListContainer = document.getElementById('person-display-list');
    visualListContainer.innerHTML = '';

	const tempList = [];
    for (let i = 0; i < allPersonFields.length; i++) 
	{
		const currentItemElement = allPersonFields[i];

		const fnameValue = currentItemElement.querySelector('firstName').textContent;
		const lnameValue = currentItemElement.querySelector('lastName').textContent;
		const suffixValue = currentItemElement.querySelector('suffix').textContent;
		const dobValue = currentItemElement.querySelector('birthDate').textContent;
		const dodValue = currentItemElement.querySelector('deathDate').textContent;
		const bioValue = currentItemElement.querySelector('bio').textContent;

	  const formattedPerson = 
	  {
		  id: i+1,
		  firstName: fnameValue,
		  lastName: lnameValue,
		  suffix: suffixValue,
		  dobValue: birthDate,
		  dodValue: deathDate,
		  bioValue: bio
	  };
	  
	  tempList.push(formattedPerson);
    }
	return tempList;
	
  }
  catch (error) 
  {
    console.error('Failed to acquire data:', error);
	return [];
  }
}
loadDatabase();
