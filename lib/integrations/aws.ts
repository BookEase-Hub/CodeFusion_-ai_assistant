export interface AWSCredentials {
  accessKeyId: string
  secretAccessKey: string
  region: string
}

export interface S3Bucket {
  Name: string
  CreationDate: string
}

export interface EC2Instance {
  InstanceId: string
  InstanceType: string
  State: {
    Name: string
  }
  LaunchTime: string
  PublicIpAddress?: string
}

export class AWSIntegration {
  static async testConnection(credentials: AWSCredentials): Promise<boolean> {
    try {
      // This would typically use AWS SDK on your backend
      const response = await fetch("/api/aws/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      return response.ok
    } catch {
      return false
    }
  }

  static async getS3Buckets(credentials: AWSCredentials): Promise<S3Bucket[]> {
    const response = await fetch("/api/aws/s3/buckets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch S3 buckets: ${response.statusText}`)
    }

    return response.json()
  }

  static async getEC2Instances(credentials: AWSCredentials): Promise<EC2Instance[]> {
    const response = await fetch("/api/aws/ec2/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch EC2 instances: ${response.statusText}`)
    }

    return response.json()
  }
}
