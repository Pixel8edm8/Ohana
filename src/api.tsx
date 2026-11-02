import { useState, useEffect } from 'react';

export async function loadDatabase() 
{  
  try 
  {
    const networkResponse = await fetch('http://localhost:3000/api/items');
    
    const rawXmlTextString = await networkResponse.text();
    const xmlTranslatorEngine = new DOMParser();
    
    const parsedXmlDocument = xmlTranslatorEngine.parseFromString(rawXmlTextString, 'application/xml');

    const allPersonFields = parsedXmlDocument.querySelectorAll('person');
    
    // Line 8: Find your pre-existing HTML list container inside your HTML page using its unique ID identifier.
    const visualListContainer = document.getElementById('item-display-list');
    
    visualListContainer.innerHTML = '';

	const tempList = [];
    for (let i = 0; i < allPersonFields.length; i++) 
	{
      const currentItemElement = allPersonFields[i];

      const nameValue = currentItemElement.getElementsByTagName('name').textContent;
      const noteValue = currentItemElement.getElementsByTagName('note').textContent;

	  const formattedPerson = 
	  {
		id: i,
		name: x,
		note: xx
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
