import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import deleteIcon from './delete90.png';
import { MyWeek } from './MyWeeks';
import Login from './login';
import Logout from './logout';
import { useAuth0 } from '@auth0/auth0-react';
import { deleteWeek, editUserWeek, getAllUserWeek, saveUserWeek } from './FetchWeek';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;



function App() {

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [weekId, setWeekId] = useState(null);
  const [weekName, setWeekName] = useState('');
  const [days, setDays] = useState([{ id: uuidv4(), dayName: '', breakfast: '', lunch: '', dinner: '', ingredients: '' }]);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const { user, isAuthenticated } = useAuth0();
  const [userWeek, setUserWeek] = useState([]);
  const userId = user && user.sub ? user.sub.split('|').pop() : '';
  const [shoppingList, setShoppingList] = useState([]);
  const addDay = () => {
    setDays([...days, { id: uuidv4(), dayName: '', breakfast: '', lunch: '', dinner: '', ingredients: '' }]);
  };

  const handleChange = (id, event) => {
    const { name, value } = event.target;
    const updatedDays = days.map(day => (day.id === id ? { ...day, [name]: value } : day));
    setDays(updatedDays);
  }

  const removeDay = (id) => {
    const updatedDays = days.filter(day => day.id !== id);
    setDays(updatedDays);
  };

  const checkFields = useCallback(() => {
    if (weekName.trim() === '') return false;
    for (let day of days) {
        if (day.dayName.trim() === '') return false;
    }
    return true;
}, [weekName, days]);

  useEffect(() => {
    setIsSaveEnabled(checkFields());
  }, [weekName, days, checkFields]);

  useEffect(() => {
    console.log(userId);
    getAllUserWeek(userId, setUserWeek)
  }, [userId]);

  const handleSaveWeek = () => {
    saveUserWeek(userId, weekName, days)
      .then(() => {
        getAllUserWeek(userId, setUserWeek);
        setWeekName('');
        setDays([{ id: uuidv4(), dayName: '', breakfast: '', lunch: '', dinner: '', ingredients: '' }]);
        setShowForm(false);
        alert('Week saved');
      })
      .catch((error) => {
        console.error('Error saving week:', error);
        alert('Something went wrong. Try again, please!')
      });
      
  };

  const handleEditWeek = (weekId, weekName, days) => {
    setWeekName(weekName);
    setDays([...days]);
    setEditing(true);
    setShowForm(true);
    setWeekId(weekId)
  };

  const handleSaveEditedWeek = () => {
    editUserWeek(weekId, weekName, days)
      .then(() => {
        getAllUserWeek(userId, setUserWeek);
        setWeekName('');
        setDays([]);
        setEditing(false);
        setShowForm(false);
        alert('Week edited and saved');
      })
      .catch((error) => {
        console.error('Error editing week:', error);
        alert('Something went wrong. Try again, please!')
      });
  };


  const handleDeleteWeek = (weekId) => {
    console.log('Deleting week with id in handle:', weekId);
    deleteWeek(weekId)
      .then(() => {
        getAllUserWeek(userId, setUserWeek);
      })
      .catch((error) => {
        console.error('Error deleting week:', error);
      });
  };
  
  const numberOfLiElementsPerWeek = userWeek.map(week => {
    return week.days.flatMap(day => day.ingredients.split(',')).filter(ingredient => ingredient.trim() !== '').length;
});
const totalLiElements = numberOfLiElementsPerWeek.reduce((total, count) => total + count, 0) - 1;

  const closeForm = () => {
    setWeekName('');
    setDays([]);
    setEditing(false);
    setShowForm(false);
  }
  
  const handleCreatePDF = (weekId) => {
    const selectedWeek = userWeek.find((week) => week._id === weekId);
    if (selectedWeek) {
      const uniqueIngredients = {};
  
      const promises = selectedWeek.days.flatMap((day) => day.ingredients.split(',').map(async (ingredient) => {
        const trimmedIngredient = ingredient.trim().toLowerCase();
        if (trimmedIngredient !== '') {
          if (!uniqueIngredients[trimmedIngredient]) {
            uniqueIngredients[trimmedIngredient] = {
              quantity: document.querySelector(`input[data-ingredient="${ingredient.trim().toLowerCase()}"]`).value,
              unit: document.querySelector(`select[data-ingredient="${ingredient.trim().toLowerCase()}"]`).value,
            };
          }
        }
      }));
  
      Promise.all(promises).then(() => {
        const shoppingListData = Object.keys(uniqueIngredients).map((ingredient) => ({
          ingredient: ingredient,
          quantity: uniqueIngredients[ingredient].quantity,
          unit: uniqueIngredients[ingredient].unit
        }));
  
        setShoppingList(shoppingListData);
  
        const shoppingListContent = shoppingList.map(item => `${item.quantity} ${item.unit} ${item.ingredient}`).join('\n');
        const documentDefinition = {
          content: [
            { text: 'Your shopping list', style: 'header' },
            { text: shoppingListContent, style: 'list' }
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10]
            },
            list: {
              fontSize: 14,
              margin: [0, 0, 0, 10]
            }
          }
        };
        pdfMake.createPdf(documentDefinition).open();
      });
    }
  };

  
  if (!isAuthenticated) {
    return ( 
      <div>
        <Login />
      </div>
    );
  }

  return (
    <div className="App">
      <Logout />
      <div>
        <div className='header'>
          <h1>Create your meal plan for a week</h1>
        </div>
        <div className='main-container-for-weeks'>
          <div className='weeks'>
            <button onClick={() => setShowForm(true)}>Create new week</button>
            <div>
              <MyWeek userWeek = {userWeek} onDeleteWeek = {handleDeleteWeek} onEditWeek={handleEditWeek}/>
            </div>
          </div>
      {showForm && (
        <div className='form'>
          <div className='delete-icon-position'>
            <img className='delete-icon' onClick={closeForm} src={deleteIcon} alt="delete"width="30px" />
          </div>
          <div className='week-name-container'>
            <label className='form-label' htmlFor="weekName"><span className='important'>*</span>Week: </label>
            <input className='week-name' type="text" id='weekName' value={weekName} onChange={(e) => setWeekName(e.target.value)} placeholder='Week name' />
          </div>
          {days.map((day) => (
          <div key={day.id} className='dayOfTheWeek'>
            <div className='meals'>
            <span className='important'>*</span>
              <select className='dayName' name="dayName" value={day.dayName} onChange={(e) => handleChange(day.id, e)}>
                <option value="">Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <div>
                <label className='lableForAWeek' htmlFor="breakfast">Breakfast</label><br />
                <input className='inputForAWeek' type="text" name="breakfast" value={day.breakfast} onChange={(e) => handleChange(day.id, e)} placeholder='Enter meals' />
              </div>
              <div>
                <label className='lableForAWeek' htmlFor="lunch">Lunch</label><br />
                <input className='inputForAWeek' type="text" name="lunch" value={day.lunch} onChange={(e) => handleChange(day.id, e)} placeholder='Enter meals' />
              </div>
              <div>
                <label className='lableForAWeek' htmlFor="dinner">Dinner</label><br />
                <input className='inputForAWeek' type="text" name="dinner" value={day.dinner} onChange={(e) => handleChange(day.id, e)} placeholder='Enter meals' />
              </div>
              <button onClick={() => removeDay(day.id)}>Remove Day</button>
            </div>
            <div className='ingredients'>
              <label>Ingredients</label>
              <textarea className='textarea' name="ingredients" value={day.ingredients} onChange={(e) => handleChange(day.id, e)} placeholder='Enter ingredients' />
            </div>
          </div>
        ))}
        <div className='header'>
          <button onClick={addDay}>Add Day</button>
        </div>
        <div className='btn-save-container'>
        {editing ? (
                <button onClick={handleSaveEditedWeek}>Save Edited Week</button>
              ) : (
                <button disabled={!isSaveEnabled} onClick={handleSaveWeek}>Save</button>
              )}
        </div>
      </div>
      )}
      <div className='shopping-list-container'>
        <div>
          <div className='header'>
            <h3>Shopping lists {totalLiElements}</h3>
          </div>
          {userWeek.map((week) => (
      <div key={week._id}>
        <h4>{week.weekName}</h4>
        <ul>
          {week.days.flatMap((day) => day.ingredients.split(',').map((ingredient) => ingredient.trim().toLowerCase())).filter((value, index, self) => value && self.indexOf(value) === index).map((ingredient, index) => (
            <li key={index}><p><input className='quantity' 
            type="text" data-ingredient={ingredient}/> 
            <select className='qty' data-ingredient={ingredient} >
            <option value="">qty</option>
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="kg">kg</option>
            <option value="l">l</option>
            <option value="pc">pc</option>
            <option value="pkt">pkt</option>
          </select><span className='span'>{ingredient}</span></p></li>
          ))}
        </ul>
        <button onClick={() => handleCreatePDF(week._id)}>Create PDF</button>
      </div>
    ))}
          
        </div>
        
      </div>
      </div>
      
    </div>
    
    
    </div>
  )
}

export default App;
