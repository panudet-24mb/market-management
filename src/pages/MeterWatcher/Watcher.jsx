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
  Stack,
} from '@chakra-ui/react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

export default function MeterReader() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [snapShotUrl, setSnapShotUrl] = useState('');
  const [meterReading, setMeterReading] = useState('');
  const [meterDigits, setMeterDigits] = useState(['', '', '', '', '', '']);
  const [ocrDebugText, setOcrDebugText] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [fullImageFilename, setFullImageFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const toast = useToast();

  const ROI = {
    top: 0.3,
    left: 0.2,
    width: 0.6,
    height: 0.1275,
  };

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
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [toast]);

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

      const filename = response.data.filename;
      setFullImageFilename(filename);
      return filename;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.detail || 'Failed to upload the image.',
        status: 'error',
        isClosable: true,
      });
      return null;
    }
  };

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

    const fullImageFilename = await uploadFullImage(canvas);

    if (!fullImageFilename) {
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
      const blob = await fetch(roiBase64).then((res) => res.blob());      
      const formData = new FormData();
      formData.append('image', blob, `meter-roi-${Date.now()}.png`);

      const response = await axios.post('https://gogo.justfordev.online/api/recognized/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const recognizedArray = response.data.recognized_array || [];
      const cleanedText = recognizedArray.map((digit) => digit.toString()).join('');
      setMeterReading(cleanedText);
      setMeterDigits(cleanedText.split(''));
      setOcrDebugText(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('OCR API error:', error);
      toast({
        title: 'OCR Failed',
        description: error.response?.data?.detail || 'An error occurred.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleDigitChange = (index, newVal) => {
    if (!/^\d?$/.test(newVal)) return;
    const updated = [...meterDigits];
    updated[index] = newVal;
    setMeterDigits(updated);
    setMeterReading(updated.join(''));
  };

  const handleQrRead = (result) => {
    if (result && result.text !== assetTag) {
      setAssetTag(result.text);
    }
  };

  const handleSubmit = async () => {
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

      setMeterReading('');
      setMeterDigits(['', '', '', '', '', '']);
      setAssetTag('');
      setSnapShotUrl('');
      setOcrDebugText('');
      setFullImageFilename('');
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
    <Box w="100%" minH="100vh" bg="gray.50" py={4} px={4}>
      <Center mb={4}>
        <Heading size="lg" color="teal.600">
          SpaceDee - Watcher OCR
        </Heading>
      </Center>

      <Box position="relative" mb={4}>
        <video ref={videoRef} style={{ width: '100%', height: 'auto', borderRadius: 'md' }} />
        <Box
          position="absolute"
          border="2px dashed red"
          top={`${ROI.top * 100}%`}
          left={`${ROI.left * 100}%`}
          width={`${ROI.width * 100}%`}
          height={`${ROI.height * 100}%`}
          pointerEvents="none"
        />
      </Box>

      <Center mb={4}>
        <Button colorScheme="teal" onClick={handleSnap} isLoading={isLoading}>
          Snap
        </Button>
      </Center>

      {isLoading && (
        <Box mx="auto" mb={4} maxW="400px">
          <Progress value={progress} size="sm" colorScheme="teal" />
        </Box>
      )}

      {snapShotUrl && (
        <Center mb={4}>
          <Image src={snapShotUrl} alt="Snapshot" maxH="200px" />
        </Center>
      )}

      <Center mb={4}>
        <Flex justify="center" gap={2}>
          {meterDigits.map((digit, index) => (
            <Input
              key={index}
              textAlign="center"
              maxLength={1}
              width="3rem"
              height="4rem"
              fontSize="2xl"
              fontWeight="bold"
              border="2px solid teal"
              borderRadius="md"
              bg="gray.100"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
            />
          ))}
        </Flex>
      </Center>

      <Center mb={4}>
        <Text fontSize="lg" color="gray.700">
          Meter Reading: {meterReading || '---'}
        </Text>
      </Center>

      <Stack spacing={4} align="center">
        <Text fontSize="md" color="gray.600">
          Asset Tag: {assetTag || '---'}
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={!meterReading || !assetTag || isLoading}
        >
          Submit
        </Button>
      </Stack>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={(result) => result && handleQrRead(result)}
        containerStyle={{
          width: '0px',
          height: '0px',
          overflow: 'hidden',
          position: 'absolute',
        }}
      />
    </Box>
  );
}
