import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Center,
  Heading,
  Image,
  Input,
  Text,
  Progress,
  useToast,
} from '@chakra-ui/react'
import Tesseract from 'tesseract.js'

export default function MeterReader() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [snapShotUrl, setSnapShotUrl] = useState('')
  const [meterReading, setMeterReading] = useState('')
  const [ocrDebugText, setOcrDebugText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const toast = useToast()

  // ROI (เป็นเปอร์เซ็นต์)
  const ROI = {
    top: 0.3,
    left: 0.2,
    width: 0.6,
    height: 0.2,
  }

  // เปิดกล้องเมื่อ mount
  useEffect(() => {
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      })
      .catch(err => {
        console.error('Error accessing camera: ', err)
        toast({
          title: 'Error accessing camera',
          description: err.message,
          status: 'error',
          isClosable: true,
        })
      })

    // หยุดกล้องเมื่อ unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [toast])

  // Snap + OCR เฉพาะ ROI
  const handleSnap = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsLoading(true)
    setProgress(0)
    setMeterReading('')
    setOcrDebugText('')
    setSnapShotUrl('')

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // คำนวณพิกัด ROI เป็น px
    const x = canvas.width * ROI.left
    const y = canvas.height * ROI.top
    const w = canvas.width * ROI.width
    const h = canvas.height * ROI.height

    // ดึง ImageData เฉพาะ ROI
    const roiImageData = ctx.getImageData(x, y, w, h)

    // สร้าง canvas ย่อย
    const roiCanvas = document.createElement('canvas')
    const roiCtx = roiCanvas.getContext('2d')
    roiCanvas.width = w
    roiCanvas.height = h
    roiCtx.putImageData(roiImageData, 0, 0)

    // ได้ base64 เฉพาะ ROI
    const roiBase64 = roiCanvas.toDataURL('image/png')
    setSnapShotUrl(roiBase64)

    try {
      const result = await Tesseract.recognize(roiBase64, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
        // เพิ่ม config เพื่ออ่านเฉพาะ digits
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: 7, // single text line
      })

      const fullText = result.data.text
      setOcrDebugText(fullText)

      // ดึงเฉพาะตัวเลข
      let cleanedText = fullText.replace(/\D+/g, '')
      // จำกัดที่ 6 หลัก (หรือกำหนดตามจริง)
      cleanedText = cleanedText.slice(0, 6)

      setMeterReading(cleanedText)
    } catch (error) {
      console.error('OCR error:', error)
      toast({
        title: 'OCR Failed',
        description: error.message,
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
      setProgress(100)
    }
  }

  return (
    <Box w="100%" minH="100vh" bg="gray.100" py={4} px={2}>
      <Center mb={4}>
        <Heading size="md">คุณปพน ถ่ายเสดแล้วแคปให้ผมด้วย</Heading>
      </Center>

      {/* แสดง video */}
      <Box position="relative" mb={4}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: 'auto' }}
        />
        {/* กรอบ ROI */}
        <Box
          position="absolute"
          border="3px dashed red"
          pointerEvents="none"
          top="30%"
          left="20%"
          width="60%"
          height="20%"
        />
      </Box>

      {/* ปุ่ม Snap */}
      <Center mb={2}>
        <Button colorScheme="teal" onClick={handleSnap} isDisabled={isLoading}>
          {isLoading ? 'กำลัง Snap...' : 'Snap'}
        </Button>
      </Center>

      {/* Progress */}
      {isLoading && (
        <Box mx="auto" mb={2} maxW="400px">
          <Progress value={progress} size="sm" colorScheme="teal" />
          <Center mt={1}>
            <Text fontSize="sm">Analyzing... {progress}%</Text>
          </Center>
        </Box>
      )}

      {/* ภาพตัวอย่าง ROI */}
      {snapShotUrl && (
        <Center mb={4}>
          <Box border="1px solid #ccc" borderRadius="md" p={2}>
            <Text fontSize="sm" mb={2}>ROI Preview</Text>
            <Image src={snapShotUrl} alt="ROI Snapshot" maxH="200px" />
          </Box>
        </Center>
      )}

      {/* แสดงเลข (6 หลัก) */}
      <Box mb={4} maxW="300px" mx="auto">
        <Text>หน่วยที่ใช้ (6 หลัก):</Text>
        <Input
          type="text"
          maxLength={6}
          value={meterReading}
          onChange={(e) => setMeterReading(e.target.value)}
          bg="white"
        />
      </Box>

      {/* Debug text */}
      {ocrDebugText && (
        <Box
          bg="white"
          p={3}
          borderRadius="md"
          boxShadow="md"
          maxW="600px"
          mx="auto"
        >
          <Text fontSize="sm" mb={1} fontWeight="bold">OCR Debug Text:</Text>
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {ocrDebugText}
          </Text>
        </Box>
      )}

      {/* Canvas สำหรับวาด video */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  )
}
