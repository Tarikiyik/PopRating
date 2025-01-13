import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { compare, hash } from 'bcryptjs';  

export async function POST(request: NextRequest) {
    try {
        const { username, userid, birthday, oldpassword, newpassword, newpasswordc,userbg,userdesc,favsecure,prfsecure } = await request.json();
        console.log({ username, userid, birthday, oldpassword, newpassword, newpasswordc,userbg ,userdesc,favsecure,prfsecure});
        console.log('Received data:', { favsecure, prfsecure });
        if (username) {
            const checkExistingUsername = await query('SELECT * FROM public."Users" WHERE username=$1', [username]);
            if (checkExistingUsername.rows.length > 0) {
                return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
            }
        }

        let response;
        let updateFields: string[] = [];
        let updateValues: (string | Date)[] = [];
        let index = 1;

        if (username) {
            if (username.length > 95){
                return NextResponse.json({ message: 'Username can have a maximum of 255 characters.' }, { status: 400 });
            }
            updateFields.push(`username=$${index++}`);
            updateValues.push(username);
        }
        if(userdesc){
            if (username.length > 255){
                return NextResponse.json({ message: 'User description can have a maximum of 255 characters.' }, { status: 400 });
            }
            updateFields.push(`userdesc=$${index++}`)
            updateValues.push(userdesc)
        }
        
        if (birthday) {
            const birthDayDate = new Date(birthday)
            const currentDate = new Date()
            if (birthDayDate > currentDate){
                return NextResponse.json({ message: 'Invalid birthday please select a valid date' }, { status: 400 });
            }
            updateFields.push(`birthday=$${index++}`);
            updateValues.push(birthday);
        }
        
        if(userbg){
            updateFields.push(`userbg=$${index++}`)
            updateValues.push(userbg)
        }

        if (favsecure !== undefined) {
            updateFields.push(`"favsecure"=$${index++}`);
            updateValues.push(favsecure);
        }

        if (prfsecure !== undefined) {
            updateFields.push(`"prfsecure"=$${index++}`);
            updateValues.push(prfsecure);
        }

        if (oldpassword && newpassword && newpasswordc) {
            if (newpassword.length < 8 || newpassword.length > 16){
                return NextResponse.json({ message: 'Password must be between 8 and 16 characters long.' }, { status: 400 });
            }
            if (newpassword !== newpasswordc) {
                return NextResponse.json({ message: 'New passwords do not match' }, { status: 400 });
            }

            const user = await query('SELECT * FROM public."Users" WHERE userid=$1', [userid]);
            if (user.rows.length === 0) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            const isOldPasswordCorrect = await compare(oldpassword, user.rows[0].password);
            if (!isOldPasswordCorrect) {
                return NextResponse.json({ message: 'Old password is incorrect' }, { status: 400 });
            }

            const hashedNewPassword = await hash(newpassword, 10);
            updateFields.push(`password=$${index++}`);
            updateValues.push(hashedNewPassword);
        }

        updateValues.push(userid);

        if (updateFields.length === 0) {
            return NextResponse.json({ message: 'There are no fields to update' }, { status: 409 });
        }

        const queryText = `UPDATE public."Users" SET ${updateFields.join(', ')} WHERE userid = $${index} RETURNING *`;
        response = await query(queryText, updateValues);

        if (response.rows.length > 0) {
            return NextResponse.json({ message: 'Update successful', user: response.rows[0] }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'User not found' }, { status: 401 });
        }

    } catch (e) {
        console.log({ e });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}