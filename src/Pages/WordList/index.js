import List from './List';

// task 4: style the single input-field form

const WordList = () => {
    return (
        <div>
            <div style={{
                fontSize: '4rem',
                lineHeight: '4rem',
                fontWeight: 'bold',
            }}>
                Saved Words
            </div>
            <div>
            <List />
            </div>

        </div>
    );
};

export default WordList;