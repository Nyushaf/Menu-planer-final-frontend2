import { AiFillEdit, AiFillDelete } from "react-icons/ai";

export const MyWeek = ({userWeek, onDeleteWeek, onEditWeek}) => {
    return(
        <div>
            {userWeek.map((week) => (
                <div key = {week._id} className="accordion">
                    <div className="tab">
                    <input className="input" type="checkbox" id={`week-${week._id}`} />
                    <label htmlFor={`week-${week._id}`} className="tab__label" >
                    <p>Week: {week.weekName} <span className="label-position"><AiFillEdit className="edit-delete-btn" onClick={() => onEditWeek(week._id, week.weekName, week.days)} /> <AiFillDelete className="edit-delete-btn" onClick={() => onDeleteWeek(week._id)} /> </span></p>
                    </label>
                    <div className="accordion-content tab__content" >
                    {week.days.map((day) => (
                        <div key={day._id}>
                            <h4 className="day-name-style">{day.dayName}</h4>
                            <p>Breakfast: {day.breakfast} </p>
                            <p>Lunch: {day.lunch}</p>
                            <p>Dinner: {day.dinner}</p>
                        </div>
                    ))}
                    
                    </div>
                    </div>
                </div>
            ))}
            
        </div>
    )
}