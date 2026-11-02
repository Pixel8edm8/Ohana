export default function FamilyTree() 
{
    return 
    (
        /*-- Placeholder --
        <>
            <h1>Hello! You got in. Yay!</h1>
        </>*/
        <div>
            <h1>Items List From Database</h1>
            <ul id="item-display-list">
                {items.map(function (item) 
                {
                    return (<li key={item.id}> {item.name} — {item.note} </li>);
                })}
            </ul>
        </div>        
    )
}
