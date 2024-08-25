import React, { useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentOption, setCurrentOption] = useState('');
  const [numVariants, setNumVariants] = useState(1);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [date, setDate] = useState('');
  const [author, setAuthor] = useState('');

  // Add a question
  const addQuestion = () => {
    if (currentQuestion.trim() === '') return;
    setQuestions(prev => [...prev, { text: currentQuestion, options: [] }]);
    setCurrentQuestion('');
  };

  // Add an option to the selected question
  const addOption = () => {
    if (selectedQuestionIndex === null || currentOption.trim() === '') return;

    setQuestions(prev => {
      const updatedQuestions = [...prev];
      const question = updatedQuestions[selectedQuestionIndex];

      // Check if the option already exists
      if (!question.options.includes(currentOption)) {
        question.options.push(currentOption);
      }

      return updatedQuestions;
    });

    setCurrentOption('');
  };

  // Update a question
  const updateQuestion = (index, newText) => {
    setQuestions(prev => {
      const updatedQuestions = [...prev];
      updatedQuestions[index].text = newText;
      return updatedQuestions;
    });
  };

  // Update an option
  const updateOption = (questionIndex, optionIndex, newOption) => {
    setQuestions(prev => {
      const updatedQuestions = [...prev];
      updatedQuestions[questionIndex].options[optionIndex] = newOption;
      return updatedQuestions;
    });
  };

  // Remove an option
  const removeOption = (questionIndex, optionIndex) => {
    setQuestions(prev => {
      const updatedQuestions = [...prev];
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      return updatedQuestions;
    });
  };

  // Remove a question
  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Shuffle array helper function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle questions and ensure they are divided into variants
  const shuffleQuestions = () => {
    const shuffled = shuffleArray(questions);
    const variantSize = Math.ceil(shuffled.length / numVariants);
    const variants = Array(numVariants)
      .fill(null)
      .map((_, i) => shuffled.slice(i * variantSize, (i + 1) * variantSize));
    setQuestions(variants.flat());
  };

  // Shuffle options within each question
  const shuffleOptions = () => {
    setQuestions(prev => prev.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    })));
  };

  // Generate PDF
  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pageMargin = 50;

    let page = pdfDoc.addPage([600, 800]);
    let { height } = page.getSize();
    let y = height - pageMargin;

    // Header
    page.drawText(`Subject: ${subject}`, { x: 400, y, size: 14, font });
    page.drawText(`Grade: ${grade}`, { x: 400, y: y - 20, size: 14, font });
    page.drawText(`Date: ${date}`, { x: 400, y: y - 40, size: 14, font });
    y -= 80;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < numVariants; i++) {
      page.drawText(`Variant ${i + 1}`, { x: pageMargin, y, size: 18, font, underline: true });
      y -= 30;

      questions.forEach((q, idx) => {
        const questionText = `${idx + 1}. ${q.text}`;
        const questionTextWidth = font.widthOfTextAtSize(questionText, 12);
        const questionTextHeight = font.heightAtSize(12);

        page.drawText(questionText, { x: pageMargin, y, size: 12, font });
        y -= questionTextHeight + 10;

        q.options.forEach((option, optIdx) => {
          const label = alphabet[optIdx % 26]; // A, B, C, ...
          const optionText = `${label}. ${option}`;
          page.drawText(optionText, { x: pageMargin + 20, y, size: 12, font });
          y -= questionTextHeight + 5;
        });

        y -= 10;

        if (y < pageMargin + 40) {
          y = height - pageMargin;
          page = pdfDoc.addPage([600, 800]);
        }
      });

      y -= 40;
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${subject || 'test'}-questions.pdf`;
    link.click();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Test Creator</h1>
      <div className="mb-4">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Fann nomini kiriting"
          className="border border-gray-300 p-2 w-full rounded mb-2"
        />
        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Sinfni kiriting"
          className="border border-gray-300 p-2 w-full rounded mb-2"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded mb-2"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Muallifning nomini kiriting"
          className="border border-gray-300 p-2 w-full rounded mb-2"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          placeholder="Savol yozing"
          className="border border-gray-300 p-2 w-full rounded mb-2"
        />
        <button onClick={addQuestion} className="bg-blue-500 text-white p-2 rounded">
          Savol qo'shish
        </button>
      </div>
      {questions.map((q, index) => (
        <div key={index} className="border border-gray-300 p-4 mb-4 rounded">
          <h2 className="text-xl font-bold">{q.text}</h2>
          <button
            onClick={() => removeQuestion(index)}
            className="bg-red-500 text-white p-2 rounded mt-2"
          >
            Savolni o'chirish
          </button>
          <div className="mt-2">
            {q.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, optIndex, e.target.value)}
                  className="border border-gray-300 p-2 w-full rounded mb-2"
                />
                <button
                  onClick={() => removeOption(index, optIndex)}
                  className="bg-red-500 text-white p-2 rounded ml-2"
                >
                  O'chirish
                </button>
              </div>
            ))}
            <input
              type="text"
              value={currentOption}
              onChange={(e) => setCurrentOption(e.target.value)}
              placeholder="Variant qo'shish"
              className="border border-gray-300 p-2 w-full rounded mb-2"
            />
            <button
              onClick={() => addOption()}
              className="bg-green-500 text-white p-2 rounded"
            >
              Variant qo'shish
            </button>
          </div>
        </div>
      ))}
      <div className="mb-4">
        <label>
          Variantlar soni:
          <input
            type="number"
            value={numVariants}
            onChange={(e) => setNumVariants(Number(e.target.value))}
            min="1"
            className="border border-gray-300 p-2 w-20 rounded ml-2"
          />
        </label>
        <button onClick={shuffleQuestions} className="bg-yellow-500 text-white p-2 rounded ml-2">
          Savollarni Aralashtirish
        </button>
        <button onClick={shuffleOptions} className="bg-yellow-500 text-white p-2 rounded ml-2">
          Variantlarni Aralashtirish
        </button>
      </div>
      <button onClick={generatePDF} className="bg-blue-500 text-white p-2 rounded">
        PDF Yaratish
      </button>
    </div>
  );
}

export default App;
