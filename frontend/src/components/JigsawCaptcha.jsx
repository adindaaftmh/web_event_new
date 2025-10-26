import React, { useState, useEffect, useRef } from 'react';
import oceanBg from "../assets/ocean.jpg";
import ocean1Bg from "../assets/ocean1.jpg";
import ocean2Bg from "../assets/ocean2.jpg";
import rajaampatBg from "../assets/rajaampat.jpg";

const JigsawCaptcha = ({ onSuccess, onError, onClose }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [puzzleData, setPuzzleData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(null);
  
  // Array of available images for puzzle
  const puzzleImages = [oceanBg, ocean1Bg, ocean2Bg, rajaampatBg];
  
  const canvasWidth = 400;
  const canvasHeight = 250;
  const gridCols = 6; // Number of puzzle columns
  const gridRows = 4; // Number of puzzle rows
  const pieceWidth = canvasWidth / gridCols;
  const pieceHeight = canvasHeight / gridRows;
  const tolerance = 8; // pixels tolerance for correct placement

  // Generate random puzzle position based on grid
  const generatePuzzle = () => {
    // Random grid position for the missing piece (avoid first and last column)
    const randomCol = Math.floor(Math.random() * (gridCols - 2)) + 1;
    const randomRow = Math.floor(Math.random() * (gridRows - 2)) + 1;
    
    const targetX = randomCol * pieceWidth;
    const targetY = randomRow * pieceHeight;
    
    setPuzzleData({
      targetX,
      targetY,
      targetCol: randomCol,
      targetRow: randomRow,
      pieceX: 0, // piece starts at left
    });
    setSliderPosition(0);
    setErrorMessage('');
  };

  useEffect(() => {
    // Select random image and load it
    const randomImage = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    setCurrentImageSrc(randomImage);
    
    const img = new Image();
    img.src = randomImage;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      generatePuzzle();
    };
  }, []);

  useEffect(() => {
    if (puzzleData && canvasRef.current && imageLoaded) {
      drawPuzzle();
    }
  }, [puzzleData, sliderPosition, imageLoaded]);

  const drawPuzzle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw ocean background image
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvasWidth, canvasHeight);
    }
    
    // Draw puzzle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 1; i < gridCols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pieceWidth, 0);
      ctx.lineTo(i * pieceWidth, canvasHeight);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i < gridRows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * pieceHeight);
      ctx.lineTo(canvasWidth, i * pieceHeight);
      ctx.stroke();
    }
    
    // Draw target slot (where piece should go) - darker overlay on empty space
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(puzzleData.targetX, puzzleData.targetY, pieceWidth, pieceHeight);
    
    // Draw dashed border around empty slot
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(puzzleData.targetX, puzzleData.targetY, pieceWidth, pieceHeight);
    ctx.setLineDash([]);
    
    // Draw movable puzzle piece
    const currentPieceX = sliderPosition;
    ctx.save();
    
    // Shadow for the piece
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Create clipping path for the puzzle piece with tabs
    drawPuzzlePieceShape(ctx, currentPieceX, puzzleData.targetY, pieceWidth, pieceHeight);
    ctx.clip();
    
    // Draw the ocean image portion that corresponds to the target position
    if (imageRef.current) {
      // Calculate source position from the image
      const srcX = (puzzleData.targetX / canvasWidth) * imageRef.current.width;
      const srcY = (puzzleData.targetY / canvasHeight) * imageRef.current.height;
      const srcWidth = (pieceWidth / canvasWidth) * imageRef.current.width;
      const srcHeight = (pieceHeight / canvasHeight) * imageRef.current.height;
      
      // Draw the image portion at current piece position
      ctx.drawImage(
        imageRef.current,
        srcX, srcY, srcWidth, srcHeight,
        currentPieceX, puzzleData.targetY, pieceWidth, pieceHeight
      );
    }
    
    ctx.restore();
    
    // Draw border for the piece
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    drawPuzzlePieceShape(ctx, currentPieceX, puzzleData.targetY, pieceWidth, pieceHeight);
    ctx.stroke();
    ctx.restore();
  };

  const drawPuzzlePieceShape = (ctx, x, y, width, height) => {
    const tabWidth = width * 0.2;
    const tabHeight = height * 0.15;
    
    ctx.beginPath();
    
    // Start from top-left corner
    ctx.moveTo(x, y);
    
    // Top side with outward tab
    ctx.lineTo(x + width * 0.35, y);
    // Draw tab curve (top)
    ctx.arcTo(
      x + width * 0.4, y - tabHeight,
      x + width * 0.5, y - tabHeight,
      tabWidth / 2
    );
    ctx.arcTo(
      x + width * 0.6, y - tabHeight,
      x + width * 0.65, y,
      tabWidth / 2
    );
    ctx.lineTo(x + width, y);
    
    // Right side with outward tab
    ctx.lineTo(x + width, y + height * 0.35);
    // Draw tab curve (right)
    ctx.arcTo(
      x + width + tabHeight, y + height * 0.4,
      x + width + tabHeight, y + height * 0.5,
      tabWidth / 2
    );
    ctx.arcTo(
      x + width + tabHeight, y + height * 0.6,
      x + width, y + height * 0.65,
      tabWidth / 2
    );
    ctx.lineTo(x + width, y + height);
    
    // Bottom side (flat)
    ctx.lineTo(x, y + height);
    
    // Left side (flat)
    ctx.lineTo(x, y);
    
    ctx.closePath();
  };

  const handleSliderMouseDown = (e) => {
    setIsDragging(true);
    setErrorMessage('');
  };

  const handleSliderMouseMove = (e) => {
    if (!isDragging) return;
    
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const maxPosition = canvasWidth - pieceWidth;
    const newPosition = Math.max(0, Math.min(x, maxPosition));
    
    setSliderPosition(newPosition);
  };

  const handleSliderTouchMove = (e) => {
    if (!isDragging) return;
    
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const maxPosition = canvasWidth - pieceWidth;
    const newPosition = Math.max(0, Math.min(x, maxPosition));
    
    setSliderPosition(newPosition);
  };

  const handleSliderMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    verifyPuzzle();
  };

  const verifyPuzzle = () => {
    setIsVerifying(true);
    
    setTimeout(() => {
      const difference = Math.abs(sliderPosition - puzzleData.targetX);
      
      if (difference <= tolerance) {
        // Success!
        setErrorMessage('');
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        // Failed
        setErrorMessage('Posisi tidak tepat! Coba lagi.');
        setTimeout(() => {
          generatePuzzle();
        }, 1000);
        onError?.();
      }
      
      setIsVerifying(false);
    }, 300);
  };

  const handleRefresh = () => {
    // Select new random image
    const randomImage = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    setCurrentImageSrc(randomImage);
    setImageLoaded(false);
    
    const img = new Image();
    img.src = randomImage;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      generatePuzzle();
    };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0A1931] mb-2">Verifikasi Jigsaw Puzzle</h2>
          <p className="text-gray-600">Geser puzzle untuk melengkapi gambar</p>
        </div>

        {/* Canvas Container */}
        <div className="bg-gray-100 rounded-xl p-4 mb-4 border-2 border-gray-200">
          <div className="relative mx-auto" style={{ width: canvasWidth, height: canvasHeight }}>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Slider Control */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
              {isVerifying ? 'Memverifikasi...' : 'Geser slider untuk memindahkan puzzle 🎯'}
            </p>
            
            <div
              className="relative h-12 bg-white rounded-lg border-2 border-gray-300 cursor-pointer overflow-hidden"
              onMouseMove={handleSliderMouseMove}
              onMouseUp={handleSliderMouseUp}
              onMouseLeave={handleSliderMouseUp}
              onTouchMove={handleSliderTouchMove}
              onTouchEnd={handleSliderMouseUp}
            >
              {/* Slider Track */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-semibold text-sm pointer-events-none">
                Geser ke kanan →
              </div>
              
              {/* Slider Button */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-14 h-10 bg-gradient-to-r from-[#4A7FA7] to-[#1A3D63] rounded-lg shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all ${
                  isDragging ? 'scale-110' : ''
                }`}
                style={{ left: `${(sliderPosition / (canvasWidth - pieceWidth)) * (100 - (14 / canvasWidth * 100))}%` }}
                onMouseDown={handleSliderMouseDown}
                onTouchStart={handleSliderMouseDown}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-3 p-2 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-sm text-red-600 font-semibold flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="w-full mt-3 px-4 py-2 bg-white border-2 border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Puzzle Baru
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default JigsawCaptcha;
