import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { name, email, password, role = 'client' } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Nombre, email y contraseña son obligatorios' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            );
        }

        if (role !== 'client' && role !== 'agent') {
            return NextResponse.json(
                { message: 'El rol debe ser client o agent' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return NextResponse.json(
                { message: 'El email ya está registrado' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
        });

        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({
            token,
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error en registro:', error);
        return NextResponse.json(
            { message: 'Error al registrar usuario' },
            { status: 500 }
        );
    }
}

