import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Heading,
  Image,
  Text,
  Progress,
  useToast,
  Flex,
  Input,
} from '@chakra-ui/react';
import Tesseract from 'tesseract.js';
import axios from 'axios';

export default function MeterReader() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [snapShotUrl, setSnapShotUrl] = useState('');
  const [fullImageFilename, setFullImageFilename] = useState('');
  const [meterReading, setMeterReading] = useState('');
  const [meterDigits, setMeterDigits] = useState(['', '', '', '', '', '']);
  const [ocrDebugText, setOcrDebugText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assetTag, setAssetTag] = useState('');

  const toast = useToast();

  // Define Region of Interest (ROI)
  const ROI = {
    top: 0.3,
    left: 0.2,
    width: 0.6,
    height: 0.1275,
  };

  // Initialize the camera
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setAttribute('playsinline', true);
      videoRef.current.setAttribute('autoplay', true);
      videoRef.current.setAttribute('muted', true);
    }

    const constraints = {
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        toast({
          title: 'Error accessing camera',
          description: err.message,
          status: 'error',
          isClosable: true,
        });
      });

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [toast]);

  // Upload full image to server
  const uploadFullImage = async (canvas) => {
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
      const formData = new FormData();
      formData.append('file', new File([blob], `meter-full-${Date.now()}.png`));

      const response = await axios.post('https://gogo.justfordev.online/api/upload_bill', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFullImageFilename(response.data.filename);
      return response.data.filename;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.detail || 'Failed to upload the image.',
        status: 'error',
        isClosable: true,
      });
    }
  };

  // Handle snapshot and OCR
  const handleSnap = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setProgress(0);
    setMeterReading('');
    setMeterDigits(['', '', '', '', '', '']);
    setOcrDebugText('');
    setSnapShotUrl('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Upload the full uncropped image
    const fullImageName = await uploadFullImage(canvas);
    if (!fullImageName) {
      setIsLoading(false);
      return;
    }

    const x = canvas.width * ROI.left;
    const y = canvas.height * ROI.top;
    const w = canvas.width * ROI.width;
    const h = canvas.height * ROI.height;

    const roiImageData = ctx.getImageData(x, y, w, h);
    const roiCanvas = document.createElement('canvas');
    const roiCtx = roiCanvas.getContext('2d');

    roiCanvas.width = w;
    roiCanvas.height = h;
    roiCtx.putImageData(roiImageData, 0, 0);

    const roiBase64 = roiCanvas.toDataURL('image/png');
    setSnapShotUrl(roiBase64);

    try {
      const result = await Tesseract.recognize(roiBase64, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: 7,
      });

      const fullText = result.data.text;
      setOcrDebugText(fullText);

      let cleanedText = fullText.replace(/\D+/g, '').padStart(6, '0').slice(-6);

      setMeterReading(cleanedText);
      setMeterDigits(cleanedText.split(''));
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: 'OCR Failed',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  // Submit meter reading to API
  const handleSubmit = async () => {
    if (!assetTag || !meterReading || !fullImageFilename) {
      toast({
        title: 'Error',
        description: 'Please provide asset tag, meter reading, and upload an image.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post('https://gogo.justfordev.online/api/meter_usage', null, {
        params: {
          asset_tag: assetTag,
          meter_end: parseInt(meterReading, 10),
          img_path: fullImageFilename,
         
        },
      });

      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        isClosable: true,
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.detail || 'An error occurred.',
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Box w="100%" minH="100vh" bg="gray.100" py={4} px={2}>
      <Center mb={4}>
        <Heading size="md">Meter Reader</Heading>
      </Center>

      <Box position="relative" mb={4}>
        <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />
        <Box
          position="absolute"
          border="3px dashed red"
          pointerEvents="none"
          top={`${ROI.top * 100}%`}
          left={`${ROI.left * 100}%`}
          width={`${ROI.width * 100}%`}
          height={`${ROI.height * 100}%`}
        />
      </Box>

      <Center mb={2}>
        <Button colorScheme="teal" onClick={handleSnap} isDisabled={isLoading}>
          {isLoading ? 'Processing...' : 'Snap'}
        </Button>
      </Center>

      {snapShotUrl && (
        <Center mb={4}>
          <Box border="1px solid #ccc" borderRadius="md" p={2} bg="white">
            <Text fontSize="sm" mb={2}>Snapshot Preview</Text>
            <Image src={snapShotUrl} alt="Snapshot" maxH="200px" />
          </Box>
        </Center>
      )}

      <Center mb={4}>
        <Flex gap={2}>
          {meterDigits.map((digit, index) => (
            <Input
              key={index}
              type="text"
              textAlign="center"
              maxLength={1}
              width="3rem"
              height="3rem"
              fontSize="2xl"
              value={digit}
              onChange={(e) => {
                const updatedDigits = [...meterDigits];
                updatedDigits[index] = e.target.value;
                setMeterDigits(updatedDigits);
                setMeterReading(updatedDigits.join(''));
              }}
            />
          ))}
        </Flex>
      </Center>

      <Box mb={4}>
        <Input
          placeholder="Enter Asset Tag"
          value={assetTag}
          onChange={(e) => setAssetTag(e.target.value)}
          mb={2}
        />
        <Button colorScheme="blue" onClick={handleSubmit}>
          Submit Meter Reading
        </Button>
      </Box>

      {ocrDebugText && (
        <Box bg="white" p={3} borderRadius="md" boxShadow="md" maxW="600px" mx="auto">
          <Text fontSize="sm" fontWeight="bold">Debug Info:</Text>
          <Text fontSize="sm" whiteSpace="pre-wrap">{ocrDebugText}</Text>
        </Box>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
}
