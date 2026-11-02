import React, { useState, useEffect } from 'react';
import { loadDatabase } from '../api.ts';

export default function FamilyTree() 
{
	const [items, setItems] = useState([]);
    //-------------------------------------------------------------------------------------
    useEffect(function () {
        async function runDatabaseCycle() 
        {
            const databaseStuff = await loadDatabase();
            setItems(databaseStuff);
        }
        runDatabaseCycle();
    }, []);
  
  //-------------------------------------------------------------------------------------------    
    return 
    (
        /*-- Placeholder --
        <>
            <h1>Hello! You got in. Yay!</h1>
        </>*/
        <div>
            <h1>Items List From Database</h1>
            <ul id="person-display-list">
                {items.map(function (person) 
                {
                    return (
                        <li key=
                            {person.id}> 
                            {person.name} - 
                            {person.dob} -
                            {person.dod} -
                            
                    </li>);
                })}
            </ul>
        </div>        
    )
}


