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

  // แสดงภาพ snapshot (ROI) หลังจาก snap
  const [snapShotUrl, setSnapShotUrl] = useState('')

  // ข้อความ OCR ที่อ่านได้ (6 หลัก)
  const [meterReading, setMeterReading] = useState('')
  // แยกเป็น 6 digits
  const [meterDigits, setMeterDigits] = useState(['', '', '', '', '', ''])

  // Debug text จาก OCR
  const [ocrDebugText, setOcrDebugText] = useState('')

  // สถานะโหลด OCR
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const toast = useToast()

  /**
   * ROI = สัดส่วน (0-1) ของ video
   * - top: 0.3 = 30% จากขอบบน
   * - left: 0.2 = 20% จากขอบซ้าย
   * - width: 0.6 = 60% ของความกว้าง
   * - height: 0.25 = 25% ของความสูง (ตัวอย่างกำหนดเป็นสี่เหลี่ยมผืนผ้า)
   */
  const ROI = {
    top: 0.3,
    left: 0.2,
    width: 0.6,
    height: 0.25,
  }

  // ---------------------------
  //  useEffect เปิดกล้อง (iOS Fix + playsInline)
  // ---------------------------
  useEffect(() => {
    // Safari iOS ต้องกำหนด playsInline, autoplay, muted ให้ video
    if (videoRef.current) {
      videoRef.current.setAttribute('playsinline', true)
      videoRef.current.setAttribute('autoplay', true)
      videoRef.current.setAttribute('muted', true)
    }

    const constraints = {
      audio: false,
      video: {
        facingMode: 'environment', // ใช้กล้องหลัง
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err)
        // fallback: ใช้กล้องหน้าแทน
        const fallbackConstraints = {
          audio: false,
          video: { facingMode: 'user' },
        }
        navigator.mediaDevices
          .getUserMedia(fallbackConstraints)
          .then((fallbackStream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream
              videoRef.current.play()
            }
          })
          .catch((err2) => {
            console.error('Fallback error accessing camera:', err2)
            toast({
              title: 'Error accessing camera',
              description: err2.message,
              status: 'error',
              isClosable: true,
            })
          })
      })

    // Cleanup: หยุดกล้องเมื่อ unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [toast])

  // ---------------------------
  //  handleSnap: ถ่ายภาพ + OCR
  // ---------------------------
  const handleSnap = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsLoading(true)
    setProgress(0)
    setMeterReading('')
    setMeterDigits(['', '', '', '', '', ''])
    setOcrDebugText('')
    setSnapShotUrl('')

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // วาด video ลงใน canvas ขนาดเต็ม
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // ------------------------------------
    // คำนวณพิกัด px ของ ROI ให้ตรงกับ box สีแดง
    // ------------------------------------
    const x = canvas.width * ROI.left
    const y = canvas.height * ROI.top
    const w = canvas.width * ROI.width
    const h = canvas.height * ROI.height

    // ดึงเฉพาะบริเวณ ROI
    const roiImageData = ctx.getImageData(x, y, w, h)

    // สร้าง canvas ย่อยสำหรับ ROI
    const roiCanvas = document.createElement('canvas')
    const roiCtx = roiCanvas.getContext('2d')
    roiCanvas.width = w
    roiCanvas.height = h
    roiCtx.putImageData(roiImageData, 0, 0)

    // แปลงเป็น Base64
    const roiBase64 = roiCanvas.toDataURL('image/png')
    setSnapShotUrl(roiBase64)

    try {
      // OCR เฉพาะตัวเลข (PSM=7, single line)
      const result = await Tesseract.recognize(roiBase64, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: 7,
      })

      const fullText = result.data.text
      setOcrDebugText(fullText)

      // ดึงเฉพาะตัวเลข
      let cleanedText = fullText.replace(/\D+/g, '')
      // ถ้าน้อยกว่า 6 ตัว เติม 0 ข้างหน้า
      cleanedText = cleanedText.padStart(6, '0')
      // ถ้าเกิน 6 ตัว ตัดเหลือ 6
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

  // ---------------------------
  // handleDigitChange: ผู้ใช้แก้ทีละหลัก
  // ---------------------------
  const handleDigitChange = (index, newVal) => {
    if (!/^\d?$/.test(newVal)) return // รับแค่ตัวเลข 0-9 หรือว่าง
    const updated = [...meterDigits]
    updated[index] = newVal
    setMeterDigits(updated)
    setMeterReading(updated.join(''))
  }

  return (
    <Box w="100%" minH="100vh" bg="gray.100" py={4} px={2}>
      <Center mb={4}>
        <Heading size="md">Snap มิเตอร์ไฟ (Fixed ROI Rectangle)</Heading>
      </Center>

      {/* --------------------------------------------------- */}
      {/* Video + ROI: สี่เหลี่ยมผืนผ้า ตรงกับ snap 100% */}
      {/* --------------------------------------------------- */}
      <Box position="relative" mb={4} zIndex={1}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: 'auto' }}
        />
        {/* กล่อง ROI สีแดง: rectangle */}
        <Box
          position="absolute"
          border="3px dashed red"
          pointerEvents="none"
          // ตำแหน่ง + ขนาด ตรงตาม ROI ข้างบน
          top={`${ROI.top * 100}%`}
          left={`${ROI.left * 100}%`}
          width={`${ROI.width * 100}%`}
          height={`${ROI.height * 100}%`}
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
              width="3rem"
              height="3rem"
              fontSize="2xl"
              fontWeight="bold"
              bg="white"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
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
