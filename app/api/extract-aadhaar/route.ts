import { NextRequest, NextResponse } from 'next/server'
import { extractCardDetails } from 'pan-aadhaar-ocr'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import os from 'os'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to temp file (package needs file path)
    const tempDir = path.join(os.tmpdir(), 'aadhaar-ocr')
    await mkdir(tempDir, { recursive: true })
    const tempPath = path.join(tempDir, `aadhaar-${Date.now()}.jpg`)
    await writeFile(tempPath, buffer)

    // Extract details using the package
    const result = await extractCardDetails(tempPath, 'AADHAAR')
    
    console.log('Extracted result:', result)

    // The package might return different formats, adjust as needed
    return NextResponse.json({
      name: result.name || '',
      aadhaarNumber: result.aadhaarNumber || result.number || '',
      dob: result.dob || result.dateOfBirth || '',
      gender: result.gender || '',
      address: result.address || '',
    })

  } catch (error: any) {
    console.error('Aadhaar extraction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract Aadhaar details' },
      { status: 500 }
    )
  }
}