import React, { useEffect, useRef, useState } from 'react'
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
} from '@chakra-ui/react'
import Tesseract from 'tesseract.js'

export default function MeterReader() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [snapShotUrl, setSnapShotUrl] = useState('')
  const [meterReading, setMeterReading] = useState('')
  const [meterDigits, setMeterDigits] = useState(['','','','','',''])
  const [ocrDebugText, setOcrDebugText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const toast = useToast()

  // ROI
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

    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [toast])

  // Snap + OCR
  const handleSnap = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsLoading(true)
    setProgress(0)
    setMeterReading('')
    setMeterDigits(['','','','','',''])
    setOcrDebugText('')
    setSnapShotUrl('')

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // คำนวณ ROI
    const x = canvas.width * ROI.left
    const y = canvas.height * ROI.top
    const w = canvas.width * ROI.width
    const h = canvas.height * ROI.height

    // ดึง ImageData
    const roiImageData = ctx.getImageData(x, y, w, h)

    // สร้าง canvas ย่อย
    const roiCanvas = document.createElement('canvas')
    const roiCtx = roiCanvas.getContext('2d')
    roiCanvas.width = w
    roiCanvas.height = h
    roiCtx.putImageData(roiImageData, 0, 0)

    const roiBase64 = roiCanvas.toDataURL('image/png')
    setSnapShotUrl(roiBase64)

    try {
      const result = await Tesseract.recognize(roiBase64, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: 7,
      })

      const fullText = result.data.text
      setOcrDebugText(fullText)

      let cleanedText = fullText.replace(/\D+/g, '')
      // เติม 0 ด้านหน้าถ้าน้อยกว่า 6
      cleanedText = cleanedText.padStart(6, '0')
      // ถ้ามากกว่า 6 ให้ตัดเหลือ 6
      cleanedText = cleanedText.slice(-6)

      setMeterReading(cleanedText)
      setMeterDigits(cleanedText.split(''))
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

  // เปลี่ยนค่าทีละหลัก
  const handleDigitChange = (index, newVal) => {
    if (!/^\d?$/.test(newVal)) return
    const updated = [...meterDigits]
    updated[index] = newVal
    setMeterDigits(updated)
    setMeterReading(updated.join(''))
  }

  return (
    <Box w="100%" minH="100vh" bg="gray.100" py={4} px={2}>
      
      <Center mb={4}>
        <Heading size="md">คุณปพน snap มาให้ผมด้วยครับ</Heading>
      </Center>

      {/* --------------------------------------------------- */}
      {/* วิดีโอ + ROI (วางตำแหน่ง zIndex=1 เพื่ออยู่ด้านล่าง) */}
      {/* --------------------------------------------------- */}
      <Box position="relative" mb={4} zIndex={1}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: 'auto' }}
        />
        {/* กล่อง ROI */}
        <Box
          position="absolute"
          border="3px dashed red"
          pointerEvents="none"
          top="30%"
          left="20%"
          width="60%"
          height="20%"
          zIndex={2} 
        />
      </Box>

      {/* --------------------------------------------------- */}
      {/* ปุ่ม Snap */}
      {/* --------------------------------------------------- */}
      <Center mb={2} zIndex={3}>
        <Button colorScheme="teal" onClick={handleSnap} isDisabled={isLoading}>
          {isLoading ? 'กำลัง Snap...' : 'Snap'}
        </Button>
      </Center>

      {/* --------------------------------------------------- */}
      {/* Progress OCR */}
      {/* --------------------------------------------------- */}
      {isLoading && (
        <Box mx="auto" mb={2} maxW="400px" zIndex={3}>
          <Progress value={progress} size="sm" colorScheme="teal" />
          <Center mt={1}>
            <Text fontSize="sm">Analyzing... {progress}%</Text>
          </Center>
        </Box>
      )}

      {/* --------------------------------------------------- */}
      {/* Preview ROI */}
      {/* --------------------------------------------------- */}
      {snapShotUrl && (
        <Center mb={4} zIndex={3}>
          <Box border="1px solid #ccc" borderRadius="md" p={2} bg="white">
            <Text fontSize="sm" mb={2}>ROI Preview</Text>
            <Image src={snapShotUrl} alt="ROI Snapshot" maxH="200px" />
          </Box>
        </Center>
      )}

      {/* --------------------------------------------------- */}
      {/* ช่องกรอกแบบ OTP (6 หลัก) */}
      {/* --------------------------------------------------- */}
      <Center mb={4} zIndex={3}>
        <Flex gap={2}>
          {meterDigits.map((digit, index) => (
            <Input
              key={index}
              type="text"
              textAlign="center"
              maxLength={1}
              // ปรับขนาดให้เห็นชัดเจน
              width="3rem"
              height="3rem"
              fontSize="2xl"
              fontWeight="bold"
              bg="white"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              // ถ้ารู้สึกโดนบัง อาจเพิ่ม boxShadow หรือ border ให้ชัด
              border="2px solid"
              borderColor="gray.300"
              borderRadius="md"
              zIndex={3}
            />
          ))}
        </Flex>
      </Center>

      <Center mb={2} zIndex={3}>
        <Text>หน่วยที่ใช้: {meterReading}</Text>
      </Center>

      {/* --------------------------------------------------- */}
      {/* Debug OCR Text */}
      {/* --------------------------------------------------- */}
      {ocrDebugText && (
        <Box
          bg="white"
          p={3}
          borderRadius="md"
          boxShadow="md"
          maxW="600px"
          mx="auto"
          zIndex={3}
        >
          <Text fontSize="sm" mb={1} fontWeight="bold">OCR Debug Text:</Text>
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {ocrDebugText}
          </Text>
        </Box>
      )}

      {/* Canvas (ซ่อน) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  )
}
